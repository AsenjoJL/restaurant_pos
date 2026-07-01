<?php

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array
    {
        $productId = $this->route('product')?->id ?? $this->route('product');

        return [
            'category_id' => ['sometimes', 'exists:categories,id'],
            'default_supplier_id' => ['nullable', 'exists:suppliers,id'],
            'sku' => ['sometimes', 'string', 'max:50', Rule::unique('products', 'sku')->ignore($productId)],
            'name' => ['sometimes', 'string', 'max:255'],
            'slug' => ['sometimes', 'string', 'max:255', Rule::unique('products', 'slug')->ignore($productId)],
            'description' => ['nullable', 'string'],
            'product_class' => ['sometimes', Rule::in(['RAW', 'NON_RAW'])],
            'price' => ['sometimes', 'numeric', 'min:0'],
            'base_cost' => ['sometimes', 'numeric', 'min:0'],
            'image_url' => ['nullable', 'string', 'max:2048'],
            'track_inventory' => ['sometimes', 'boolean'],
            'is_active' => ['sometimes', 'boolean'],
            'recipe_items' => ['sometimes', 'array'],
            'recipe_items.*.ingredient_product_id' => ['required_with:recipe_items', 'exists:products,id'],
            'recipe_items.*.quantity_required' => ['required_with:recipe_items', 'numeric', 'gt:0'],
            'recipe_items.*.unit' => ['nullable', 'string', 'max:20'],
        ];
    }
}
