<?php

namespace App\Http\Requests\Order;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateOrderRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array
    {
        return [
            'customer_id' => ['nullable', 'exists:customers,id'],
            'restaurant_table_id' => ['nullable', 'exists:restaurant_tables,id'],
            'discount_id' => ['nullable', 'exists:discounts,id'],
            'status' => ['sometimes', Rule::in(['PENDING_PAYMENT', 'HOLD', 'SENT_TO_KITCHEN', 'PREPARING', 'READY_FOR_PICKUP', 'COMPLETED', 'CANCELLED'])],
            'order_type' => ['sometimes', Rule::in(['DINE_IN', 'TAKEOUT'])],
            'note' => ['nullable', 'string'],
            'items' => ['sometimes', 'array', 'min:1'],
            'items.*.product_id' => ['nullable', 'exists:products,id'],
            'items.*.name' => ['required_with:items', 'string', 'max:255'],
            'items.*.price' => ['required_with:items', 'numeric', 'min:0'],
            'items.*.quantity' => ['required_with:items', 'integer', 'min:1'],
            'items.*.modifiers' => ['nullable', 'array'],
            'items.*.note' => ['nullable', 'string'],
            'items.*.bundle_items' => ['nullable', 'array'],
        ];
    }
}
