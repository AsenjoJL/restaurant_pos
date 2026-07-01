<?php

namespace App\Http\Requests\Inventory;

use Illuminate\Foundation\Http\FormRequest;

class UpdateInventoryRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array
    {
        return [
            'supplier_id' => ['nullable', 'exists:suppliers,id'],
            'quantity_on_hand' => ['sometimes', 'numeric', 'min:0'],
            'reorder_level' => ['sometimes', 'numeric', 'min:0'],
            'unit_cost' => ['sometimes', 'numeric', 'min:0'],
            'unit' => ['sometimes', 'string', 'max:20'],
        ];
    }
}
