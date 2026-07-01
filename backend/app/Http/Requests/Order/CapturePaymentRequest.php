<?php

namespace App\Http\Requests\Order;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CapturePaymentRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array
    {
        return [
            'method' => ['required', Rule::in(['CASH', 'CARD', 'GCASH', 'OTHER'])],
            'amount' => ['required', 'numeric', 'gt:0'],
            'reference' => ['nullable', 'string', 'max:100'],
            'payer' => ['nullable', 'string', 'max:255'],
            'next_status' => ['nullable', Rule::in(['PAID', 'SENT_TO_KITCHEN', 'PREPARING'])],
        ];
    }
}
