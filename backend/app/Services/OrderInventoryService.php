<?php

namespace App\Services;

use App\Models\Inventory;
use App\Models\Order;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;

class OrderInventoryService
{
    public function __construct(private readonly InventoryAdjustmentService $inventoryAdjustmentService) {}

    public function deductForOrder(Order $order, string $userId, ?string $reason = null, bool $force = false): void
    {
        if ($order->inventory_deducted_at && ! $force) {
            return;
        }

        [$requirements, $inventories] = $this->resolveLockedInventories($order);

        foreach ($requirements as $productId => $requirement) {
            /** @var Inventory $inventory */
            $inventory = $inventories->get($productId);

            $this->inventoryAdjustmentService->record(
                $inventory,
                type: 'OUT',
                reasonType: 'SALE',
                qty: $requirement['quantity'],
                reason: $reason ?? "Order {$order->order_number} submitted",
                orderId: $order->id,
                userId: $userId,
            );
        }

        $order->forceFill([
            'inventory_deducted_at' => now(),
            'inventory_restored_at' => null,
        ])->save();
    }

    public function restoreForOrder(Order $order, string $userId, string $reasonType = 'VOID', ?string $reason = null): void
    {
        if (! $order->inventory_deducted_at || $order->inventory_restored_at) {
            return;
        }

        [$requirements, $inventories] = $this->resolveLockedInventories($order, false);

        foreach ($requirements as $productId => $requirement) {
            /** @var Inventory $inventory */
            $inventory = $inventories->get($productId);

            $this->inventoryAdjustmentService->record(
                $inventory,
                type: 'IN',
                reasonType: $reasonType,
                qty: $requirement['quantity'],
                reason: $reason ?? "Order {$order->order_number} reversed",
                orderId: $order->id,
                userId: $userId,
            );
        }

        $order->forceFill([
            'inventory_restored_at' => now(),
        ])->save();
    }

    private function resolveLockedInventories(Order $order, bool $enforceSufficient = true): array
    {
        $requirements = $this->buildRequirements($order);

        if ($requirements->isEmpty()) {
            return [$requirements, collect()];
        }

        $productIds = $requirements->keys()->sort()->values()->all();
        $inventories = Inventory::query()
            ->whereIn('product_id', $productIds)
            ->orderBy('product_id')
            ->lockForUpdate()
            ->get()
            ->keyBy('product_id');

        $issues = [];

        foreach ($requirements as $productId => $requirement) {
            /** @var Inventory|null $inventory */
            $inventory = $inventories->get($productId);

            if (! $inventory) {
                $issues[] = "Tracked inventory record is missing for {$requirement['name']}.";
                continue;
            }

            if (! $enforceSufficient) {
                continue;
            }

            $available = (float) $inventory->quantity_on_hand;
            $required = (float) $requirement['quantity'];

            if ($available + 0.0001 < $required) {
                $issues[] = sprintf(
                    '%s needs %s %s, on hand %s %s.',
                    $requirement['name'],
                    $this->formatQuantity($required),
                    $inventory->unit,
                    $this->formatQuantity($available),
                    $inventory->unit,
                );
            }
        }

        if ($issues !== []) {
            throw ValidationException::withMessages([
                'inventory' => ['Inventory shortage: '.implode(' ', $issues)],
            ]);
        }

        return [$requirements, $inventories];
    }

    private function buildRequirements(Order $order): Collection
    {
        $order->loadMissing('items.product.recipeItems.ingredient');

        return $order->items
            ->reduce(function (Collection $requirements, $item) {
                $product = $item->product;

                if (! $product) {
                    return $requirements;
                }

                $recipeItems = $product->recipeItems;

                if ($recipeItems->isEmpty()) {
                    if (! $product->track_inventory) {
                        return $requirements;
                    }

                    return $this->pushRequirement(
                        $requirements,
                        productId: $product->id,
                        name: $product->name,
                        quantity: (float) $item->quantity,
                    );
                }

                foreach ($recipeItems as $recipeItem) {
                    if (! $recipeItem->ingredient?->track_inventory) {
                        continue;
                    }

                    $requirements = $this->pushRequirement(
                        $requirements,
                        productId: $recipeItem->ingredient_product_id,
                        name: $recipeItem->ingredient?->name ?? $recipeItem->ingredient_product_id,
                        quantity: (float) $recipeItem->quantity_required * (int) $item->quantity,
                    );
                }

                return $requirements;
            }, collect());
    }

    private function pushRequirement(Collection $requirements, string $productId, string $name, float $quantity): Collection
    {
        $existing = $requirements->get($productId, [
            'name' => $name,
            'quantity' => 0.0,
        ]);

        $existing['quantity'] = round((float) $existing['quantity'] + $quantity, 3);

        $requirements->put($productId, $existing);

        return $requirements;
    }

    private function formatQuantity(float $quantity): string
    {
        return rtrim(rtrim(number_format($quantity, 3, '.', ''), '0'), '.');
    }
}
