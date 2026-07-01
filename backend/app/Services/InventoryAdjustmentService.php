<?php

namespace App\Services;

use App\Models\Inventory;
use App\Models\InventoryAdjustment;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\HttpException;

class InventoryAdjustmentService
{
    public function applyByProductId(string $productId, array $payload, ?string $userId = null): InventoryAdjustment
    {
        return DB::transaction(function () use ($productId, $payload, $userId) {
            $inventory = Inventory::query()
                ->where('product_id', $productId)
                ->lockForUpdate()
                ->first();

            if (! $inventory) {
                throw new HttpException(422, 'Tracked inventory record is missing for the selected ingredient.');
            }

            return $this->record(
                $inventory,
                type: $payload['type'],
                reasonType: $payload['reason_type'],
                qty: (float) $payload['qty'],
                reason: $payload['reason'] ?? null,
                orderId: $payload['order_id'] ?? null,
                reference: $payload['reference'] ?? null,
                countedQty: array_key_exists('counted_qty', $payload) && $payload['counted_qty'] !== null
                    ? (float) $payload['counted_qty']
                    : null,
                userId: $userId,
            );
        });
    }

    public function record(
        Inventory $inventory,
        string $type,
        string $reasonType,
        float $qty,
        ?string $reason = null,
        ?string $orderId = null,
        ?string $reference = null,
        ?float $countedQty = null,
        ?string $userId = null,
    ): InventoryAdjustment {
        $beforeQty = (float) $inventory->quantity_on_hand;
        $delta = $type === 'IN' ? $qty : -$qty;
        $afterQty = round($beforeQty + $delta, 3);

        if ($afterQty < 0) {
            throw new HttpException(422, "Insufficient inventory for product {$inventory->product_id}.");
        }

        $inventory->forceFill([
            'quantity_on_hand' => $afterQty,
            'last_restocked_at' => $reasonType === 'RESTOCK' ? Carbon::now() : $inventory->last_restocked_at,
        ])->save();

        return InventoryAdjustment::create([
            'inventory_id' => $inventory->id,
            'product_id' => $inventory->product_id,
            'order_id' => $orderId,
            'user_id' => $userId,
            'type' => $type,
            'reason_type' => $reasonType,
            'qty' => $qty,
            'reason' => $reason,
            'reference' => $reference,
            'counted_qty' => $countedQty,
            'before_qty' => $beforeQty,
            'after_qty' => $afterQty,
            'adjusted_at' => Carbon::now(),
        ]);
    }
}
