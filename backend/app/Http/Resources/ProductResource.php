<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'sku' => $this->sku,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'price' => (float) $this->price,
            'base_cost' => (float) $this->base_cost,
            'product_class' => $this->product_class,
            'category_id' => $this->category_id,
            'category' => $this->whenLoaded('category', fn () => new CategoryResource($this->category)),
            'image_url' => $this->image_url,
            'track_inventory' => $this->track_inventory,
            'is_active' => $this->is_active,
            'inventory' => $this->whenLoaded('inventory', fn () => InventoryResource::collection($this->inventory)),
            'recipe_items' => $this->whenLoaded('recipeItems', fn () => $this->recipeItems->map(fn ($item) => [
                'id' => $item->id,
                'ingredient_product_id' => $item->ingredient_product_id,
                'ingredient_name' => $item->ingredient?->name,
                'quantity_required' => (float) $item->quantity_required,
                'unit' => $item->unit,
            ])),
        ];
    }
}
