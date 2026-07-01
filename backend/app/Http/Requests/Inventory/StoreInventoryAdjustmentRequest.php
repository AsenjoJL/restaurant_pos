<?php

namespace App\Http\Requests\Inventory;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreInventoryAdjustmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'product_id' => ['required', 'exists:products,id'],
            'type' => ['required', Rule::in(['IN', 'OUT'])],
            'reason_type' => ['required', Rule::in(['RESTOCK', 'WASTE', 'VARIANCE', 'MANUAL', 'SALE', 'RETURN'])],
            'qty' => ['required', 'numeric', 'gt:0'],
            'reason' => ['nullable', 'string', 'max:1000'],
            'order_id' => ['nullable', 'exists:orders,id'],
            'reference' => ['nullable', 'string', 'max:100'],
            'counted_qty' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
