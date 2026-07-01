<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderPlacementService
{
    public function __construct(
        private readonly CheckoutService $checkoutService,
        private readonly OrderInventoryService $orderInventoryService,
    ) {}

    public function place(array $payload, string $userId): Order
    {
        $clientReference = $payload['client_reference'] ?? null;

        if ($clientReference) {
            $existing = Order::query()
                ->where('client_reference', $clientReference)
                ->first();

            if ($existing) {
                return $existing->load(['items', 'payments.receivedBy.role', 'processedBy.role', 'modifiedBy.role', 'table', 'customer', 'discount']);
            }
        }

        try {
            return DB::transaction(function () use ($payload, $userId, $clientReference) {
                $items = $payload['items'];
                unset($payload['items']);

                $payment = $payload['payment'] ?? null;
                unset($payload['payment']);

                $order = Order::create([
                    ...$payload,
                    'client_reference' => $clientReference,
                    'order_number' => $this->nextOrderNumber(),
                    'processed_by' => $userId,
                    'modified_by' => $userId,
                    'placed_at' => $payload['placed_at'] ?? now(),
                    'status' => $payload['status'] ?? 'PENDING_PAYMENT',
                ]);

                $order->items()->createMany($items);
                $this->checkoutService->syncOrderTotals($order->load('items'), $order->discount);
                $this->orderInventoryService->deductForOrder($order->fresh('items.product.recipeItems.ingredient'), $userId);

                if ($payment) {
                    return $this->checkoutService->checkout($order, $payment, $userId);
                }

                return $order->load(['items', 'payments.receivedBy.role', 'processedBy.role', 'modifiedBy.role', 'table', 'customer', 'discount']);
            });
        } catch (QueryException $exception) {
            if ($clientReference) {
                $existing = Order::query()
                    ->where('client_reference', $clientReference)
                    ->first();

                if ($existing) {
                    return $existing->load(['items', 'payments.receivedBy.role', 'processedBy.role', 'modifiedBy.role', 'table', 'customer', 'discount']);
                }
            }

            throw $exception;
        }
    }

    private function nextOrderNumber(): string
    {
        return 'ORD-'.now()->format('YmdHis').'-'.Str::upper(Str::random(4));
    }
}
