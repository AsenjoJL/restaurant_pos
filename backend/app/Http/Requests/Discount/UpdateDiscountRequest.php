<?php

namespace App\Http\Requests\Discount;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDiscountRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array
    {
        $discountId = $this->route('discount')?->id ?? $this->route('discount');

        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'code' => ['sometimes', 'string', 'max:50', Rule::unique('discounts', 'code')->ignore($discountId)],
            'type' => ['sometimes', Rule::in(['FIXED', 'PERCENTAGE'])],
            'value' => ['sometimes', 'numeric', 'gt:0'],
            'minimum_order_amount' => ['sometimes', 'numeric', 'min:0'],
            'is_active' => ['sometimes', 'boolean'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
        ];
    }
}
