<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InventoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'supplier_id' => $this->supplier_id,
            'quantity_on_hand' => (float) $this->quantity_on_hand,
            'reorder_level' => (float) $this->reorder_level,
            'unit_cost' => (float) $this->unit_cost,
            'unit' => $this->unit,
            'last_restocked_at' => $this->last_restocked_at?->toIso8601String(),
            'product' => $this->whenLoaded('product', fn () => [
                'id' => $this->product?->id,
                'name' => $this->product?->name,
                'sku' => $this->product?->sku,
                'category' => $this->product?->category ? [
                    'id' => $this->product->category->id,
                    'name' => $this->product->category->name,
                ] : null,
            ]),
            'supplier' => $this->whenLoaded('supplier', fn () => [
                'id' => $this->supplier?->id,
                'name' => $this->supplier?->name,
            ]),
        ];
    }
}
