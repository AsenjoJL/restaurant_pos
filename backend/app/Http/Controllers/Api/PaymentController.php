<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Payment\StorePaymentRequest;
use App\Http\Resources\PaymentResource;
use App\Models\Order;
use App\Models\Payment;
use App\Services\AuditLogService;
use App\Services\CheckoutService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

class PaymentController extends Controller
{
    public function __construct(
        private readonly CheckoutService $checkoutService,
        private readonly AuditLogService $auditLogService,
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        Gate::authorize('manager-access');

        return PaymentResource::collection(Payment::query()->with('receivedBy.role')->latest('paid_at')->paginate((int) $request->integer('per_page', 15)));
    }

    public function store(StorePaymentRequest $request): PaymentResource
    {
        Gate::authorize('manage-orders');
        $order = Order::findOrFail($request->validated('order_id'));
        $updatedOrder = $this->checkoutService->checkout($order, $request->validated(), $request->user()->id);
        $payment = $updatedOrder->payments()->latest('paid_at')->firstOrFail();
        $this->auditLogService->log('payment.created', $payment, null, $payment->toArray(), 'Payment created.', $request);

        return new PaymentResource($payment->load('receivedBy.role'));
    }

    public function show(Payment $payment): PaymentResource
    {
        Gate::authorize('manager-access');

        return new PaymentResource($payment->load('receivedBy.role'));
    }
}
