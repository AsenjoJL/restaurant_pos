<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InventoryAdjustmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'inventory_id' => $this->inventory_id,
            'product_id' => $this->product_id,
            'order_id' => $this->order_id,
            'user_id' => $this->user_id,
            'type' => $this->type,
            'reason_type' => $this->reason_type,
            'qty' => (float) $this->qty,
            'reason' => $this->reason,
            'reference' => $this->reference,
            'counted_qty' => $this->counted_qty !== null ? (float) $this->counted_qty : null,
            'before_qty' => (float) $this->before_qty,
            'after_qty' => (float) $this->after_qty,
            'adjusted_at' => $this->adjusted_at?->toIso8601String(),
        ];
    }
}
