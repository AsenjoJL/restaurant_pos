<?php

namespace App\Http\Requests\Order;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array
    {
        return [
            'client_reference' => ['nullable', 'string', 'max:100'],
            'customer_id' => ['nullable', 'exists:customers,id'],
            'restaurant_table_id' => ['nullable', 'exists:restaurant_tables,id'],
            'discount_id' => ['nullable', 'exists:discounts,id'],
            'source' => ['required', Rule::in(['KIOSK', 'STAFF'])],
            'status' => ['sometimes', Rule::in(['PENDING_PAYMENT', 'HOLD', 'SENT_TO_KITCHEN', 'PREPARING', 'READY_FOR_PICKUP', 'PAID', 'COMPLETED', 'CANCELLED'])],
            'order_type' => ['required', Rule::in(['DINE_IN', 'TAKEOUT'])],
            'note' => ['nullable', 'string'],
            'payment' => ['sometimes', 'array'],
            'payment.method' => ['required_with:payment', Rule::in(['CASH', 'CARD', 'GCASH', 'OTHER'])],
            'payment.amount' => ['required_with:payment', 'numeric', 'min:0.01'],
            'payment.reference' => ['nullable', 'string', 'max:100'],
            'payment.payer' => ['nullable', 'string', 'max:255'],
            'payment.next_status' => ['sometimes', Rule::in(['PAID', 'SENT_TO_KITCHEN', 'PREPARING'])],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['nullable', 'exists:products,id'],
            'items.*.name' => ['required', 'string', 'max:255'],
            'items.*.price' => ['required', 'numeric', 'min:0'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.modifiers' => ['nullable', 'array'],
            'items.*.note' => ['nullable', 'string'],
            'items.*.bundle_items' => ['nullable', 'array'],
        ];
    }
}
