<?php

namespace App\Http\Requests\Inventory;

use Illuminate\Foundation\Http\FormRequest;

class StoreInventoryRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array
    {
        return [
            'product_id' => ['required', 'exists:products,id'],
            'supplier_id' => ['nullable', 'exists:suppliers,id'],
            'quantity_on_hand' => ['required', 'numeric', 'min:0'],
            'reorder_level' => ['required', 'numeric', 'min:0'],
            'unit_cost' => ['required', 'numeric', 'min:0'],
            'unit' => ['required', 'string', 'max:20'],
        ];
    }
}
