<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $latestPayment = $this->whenLoaded('payments', fn () => $this->payments->sortByDesc('paid_at')->first());

        return [
            'id' => $this->id,
            'order_no' => $this->order_number,
            'source' => $this->source,
            'status' => $this->status,
            'order_type' => $this->order_type,
            'table' => $this->table?->name,
            'note' => $this->note,
            'subtotal' => (float) $this->subtotal,
            'discount' => (float) $this->discount_amount,
            'service_charge' => (float) $this->service_charge_amount,
            'tax' => (float) $this->tax_amount,
            'total' => (float) $this->total_amount,
            'payment_method' => $latestPayment?->method,
            'payment_amount' => $latestPayment ? (float) $latestPayment->amount : null,
            'payment_change' => $latestPayment ? (float) $latestPayment->change_amount : null,
            'payment_reference' => $latestPayment?->reference,
            'payment_payer' => $latestPayment?->payer_name,
            'processed_by' => $this->whenLoaded('processedBy', fn () => new UserResource($this->processedBy)),
            'modified_by' => $this->whenLoaded('modifiedBy', fn () => new UserResource($this->modifiedBy)),
            'modified_at' => $this->updated_at?->toIso8601String(),
            'placed_at' => $this->placed_at?->toIso8601String(),
            'paid_at' => $this->paid_at?->toIso8601String(),
            'kitchen_sent_at' => $this->kitchen_sent_at?->toIso8601String(),
            'kitchen_started_at' => $this->kitchen_started_at?->toIso8601String(),
            'kitchen_ready_at' => $this->kitchen_ready_at?->toIso8601String(),
            'items' => $this->whenLoaded('items', fn () => $this->items->map(fn ($item) => [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'name' => $item->name,
                'price' => (float) $item->unit_price,
                'quantity' => $item->quantity,
                'modifiers' => $item->modifiers ?? [],
                'note' => $item->note,
                'bundle_items' => $item->bundle_items ?? [],
            ])),
            'audit_log' => $this->when(isset($this->audit_log), $this->audit_log),
            'payments' => $this->whenLoaded('payments', fn () => PaymentResource::collection($this->payments)),
        ];
    }
}
