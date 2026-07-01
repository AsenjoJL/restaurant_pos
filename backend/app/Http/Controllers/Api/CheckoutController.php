<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Order\CheckoutRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\AuditLogService;
use App\Services\CheckoutService;

class CheckoutController extends Controller
{
    public function __construct(
        private readonly CheckoutService $checkoutService,
        private readonly AuditLogService $auditLogService,
    ) {}

    public function store(CheckoutRequest $request, Order $order): OrderResource
    {
        $paidOrder = $this->checkoutService->checkout($order, $request->validated(), $request->user()->id);
        $this->auditLogService->log('checkout.completed', $order, null, $paidOrder->toArray(), 'Checkout completed.', $request);

        return new OrderResource($paidOrder);
    }
}
