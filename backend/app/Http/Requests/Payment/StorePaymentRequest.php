<?php

namespace App\Http\Requests\Payment;

use App\Http\Requests\Order\CapturePaymentRequest;

class StorePaymentRequest extends CapturePaymentRequest
{
    public function rules(): array
    {
        return array_merge(parent::rules(), [
            'order_id' => ['required', 'exists:orders,id'],
        ]);
    }
}
