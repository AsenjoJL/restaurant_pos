<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_id' => $this->order_id,
            'method' => $this->method,
            'amount' => (float) $this->amount,
            'change_amount' => (float) $this->change_amount,
            'reference' => $this->reference,
            'payer_name' => $this->payer_name,
            'status' => $this->status,
            'paid_at' => $this->paid_at?->toIso8601String(),
            'received_by' => $this->whenLoaded('receivedBy', fn () => new UserResource($this->receivedBy)),
        ];
    }
}
