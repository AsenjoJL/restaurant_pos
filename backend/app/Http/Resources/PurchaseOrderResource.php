<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PurchaseOrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'po_number' => $this->po_number,
            'status' => $this->status,
            'ordered_at' => $this->ordered_at?->toDateString(),
            'expected_at' => $this->expected_at?->toDateString(),
            'received_at' => $this->received_at?->toDateString(),
            'subtotal' => (float) $this->subtotal,
            'tax_amount' => (float) $this->tax_amount,
            'total_amount' => (float) $this->total_amount,
            'notes' => $this->notes,
            'supplier' => $this->whenLoaded('supplier', fn () => new SupplierResource($this->supplier)),
            'created_by' => $this->whenLoaded('createdBy', fn () => new UserResource($this->createdBy)),
            'items' => $this->whenLoaded('items', fn () => $this->items->map(fn ($item) => [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'product_name' => $item->product?->name,
                'quantity' => (float) $item->quantity,
                'unit_cost' => (float) $item->unit_cost,
                'line_total' => (float) $item->line_total,
            ])),
        ];
    }
}
