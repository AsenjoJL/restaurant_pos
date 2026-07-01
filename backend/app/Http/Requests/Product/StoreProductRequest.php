<?php

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    protected function prepareForValidation(): void { $this->merge(['slug' => $this->slug ?: Str::slug((string) $this->name)]); }
    public function rules(): array
    {
        return [
            'category_id' => ['required', 'exists:categories,id'],
            'default_supplier_id' => ['nullable', 'exists:suppliers,id'],
            'sku' => ['nullable', 'string', 'max:50', 'unique:products,sku'],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:products,slug'],
            'description' => ['nullable', 'string'],
            'product_class' => ['required', Rule::in(['RAW', 'NON_RAW'])],
            'price' => ['required', 'numeric', 'min:0'],
            'base_cost' => ['required', 'numeric', 'min:0'],
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
