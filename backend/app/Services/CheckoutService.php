<?php

namespace App\Services;

use App\Models\Discount;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\HttpException;

class CheckoutService
{
    public function __construct(private readonly OrderInventoryService $orderInventoryService) {}

    public function quote(array $items, ?Discount $discount = null, float $taxRate = 0.12, float $serviceChargeRate = 0): array
    {
        $subtotal = collect($items)->sum(fn (array $item) => ($item['quantity'] ?? 0) * ($item['price'] ?? 0));
        $discountAmount = $this->calculateDiscount($subtotal, $discount);
        $taxableBase = max($subtotal - $discountAmount, 0);
        $serviceCharge = round($taxableBase * $serviceChargeRate, 2);
        $tax = round($taxableBase * $taxRate, 2);
        $total = round($taxableBase + $serviceCharge + $tax, 2);

        return [
            'subtotal' => round($subtotal, 2),
            'discount' => $discountAmount,
            'service_charge' => $serviceCharge,
            'tax' => $tax,
            'total' => $total,
        ];
    }

    public function checkout(Order $order, array $paymentData, string $userId): Order
    {
        return DB::transaction(function () use ($order, $paymentData, $userId) {
            $lockedOrder = Order::query()
                ->whereKey($order->id)
                ->lockForUpdate()
                ->firstOrFail();

            if (! in_array($lockedOrder->status, ['PENDING_PAYMENT', 'HOLD'], true)) {
                throw new HttpException(422, 'Order cannot be checked out from its current status.');
            }

            $this->orderInventoryService->deductForOrder(
                $lockedOrder->fresh('items.product.recipeItems.ingredient'),
                $userId,
                reason: "Order {$lockedOrder->order_number} payment",
            );

            $paidAmount = (float) $paymentData['amount'];
            $totalAmount = (float) $lockedOrder->total_amount;

            if ($paidAmount < $totalAmount) {
                throw new HttpException(422, 'Payment amount is less than the order total.');
            }

            $nextStatus = $paymentData['next_status'] ?? 'PAID';

            Payment::create([
                'order_id' => $lockedOrder->id,
                'received_by' => $userId,
                'method' => $paymentData['method'],
                'amount' => $paidAmount,
                'change_amount' => round($paidAmount - $totalAmount, 2),
                'reference' => $paymentData['reference'] ?? null,
                'payer_name' => $paymentData['payer'] ?? null,
                'status' => 'CAPTURED',
                'paid_at' => Carbon::now(),
            ]);

            $orderUpdates = [
                'status' => $nextStatus,
                'processed_by' => $userId,
                'modified_by' => $userId,
                'paid_at' => Carbon::now(),
            ];

            if ($nextStatus === 'SENT_TO_KITCHEN') {
                $orderUpdates['kitchen_sent_at'] = $lockedOrder->kitchen_sent_at ?? Carbon::now();
            }

            if ($nextStatus === 'PREPARING') {
                $orderUpdates['kitchen_sent_at'] = $lockedOrder->kitchen_sent_at ?? Carbon::now();
                $orderUpdates['kitchen_started_at'] = $lockedOrder->kitchen_started_at ?? Carbon::now();
            }

            $lockedOrder->forceFill($orderUpdates)->save();

            return $lockedOrder->load(['items', 'payments.receivedBy.role', 'processedBy.role', 'modifiedBy.role', 'discount', 'table', 'customer']);
        });
    }

    public function syncOrderTotals(Order $order, ?Discount $discount = null, ?float $taxRate = null, ?float $serviceChargeRate = null): Order
    {
        $taxRate ??= (float) data_get($this->settingValue('tax', 'rate'), 'value', 0.12);
        $serviceChargeRate ??= (float) data_get($this->settingValue('service_charge', 'rate'), 'value', 0);

        $totals = $this->quote(
            $order->items->map(fn ($item) => [
                'quantity' => $item->quantity,
                'price' => $item->unit_price,
            ])->all(),
            $discount,
            $taxRate,
            $serviceChargeRate,
        );

        $order->forceFill([
            'subtotal' => $totals['subtotal'],
            'discount_amount' => $totals['discount'],
            'service_charge_amount' => $totals['service_charge'],
            'tax_amount' => $totals['tax'],
            'total_amount' => $totals['total'],
        ])->save();

        return $order;
    }

    private function calculateDiscount(float $subtotal, ?Discount $discount): float
    {
        if (! $discount || ! $discount->is_active || $subtotal < (float) $discount->minimum_order_amount) {
            return 0;
        }

        return match ($discount->type) {
            'PERCENTAGE' => round($subtotal * ((float) $discount->value / 100), 2),
            default => min(round((float) $discount->value, 2), round($subtotal, 2)),
        };
    }

    private function settingValue(string $group, string $key): array
    {
        $setting = \App\Models\Setting::query()
            ->where('group', $group)
            ->where('key', $key)
            ->first();

        return ['value' => $setting?->value['value'] ?? null];
    }
}
