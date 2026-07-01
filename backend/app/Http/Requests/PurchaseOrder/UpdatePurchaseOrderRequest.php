<?php

namespace App\Http\Requests\PurchaseOrder;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePurchaseOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'supplier_id' => ['sometimes', 'exists:suppliers,id'],
            'status' => ['sometimes', Rule::in(['DRAFT', 'SUBMITTED', 'RECEIVED', 'CANCELLED'])],
            'ordered_at' => ['nullable', 'date'],
            'expected_at' => ['nullable', 'date'],
            'received_at' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
            'items' => ['sometimes', 'array', 'min:1'],
            'items.*.product_id' => ['required_with:items', 'exists:products,id'],
            'items.*.quantity' => ['required_with:items', 'numeric', 'gt:0'],
            'items.*.unit_cost' => ['required_with:items', 'numeric', 'min:0'],
        ];
    }
}
