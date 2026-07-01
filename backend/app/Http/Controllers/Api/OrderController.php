<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Order\CapturePaymentRequest;
use App\Http\Requests\Order\StoreOrderRequest;
use App\Http\Requests\Order\UpdateOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Discount;
use App\Models\Order;
use App\Services\AuditLogService;
use App\Services\CheckoutService;
use App\Services\OrderInventoryService;
use App\Services\OrderPlacementService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Symfony\Component\HttpKernel\Exception\HttpException;

class OrderController extends Controller
{
    private const MAX_PER_PAGE = 250;

    public function __construct(
        private readonly CheckoutService $checkoutService,
        private readonly OrderPlacementService $orderPlacementService,
        private readonly OrderInventoryService $orderInventoryService,
        private readonly AuditLogService $auditLogService,
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        Gate::authorize('view-orders');

        $query = Order::query()->with(['items', 'payments.receivedBy.role', 'processedBy.role', 'modifiedBy.role', 'table', 'customer', 'discount']);

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        if ($request->filled('search')) {
            $search = $request->string('search')->toString();
            $query->where('order_number', 'like', "%{$search}%");
        }

        $perPage = min(max((int) $request->integer('per_page', 15), 1), self::MAX_PER_PAGE);

        return OrderResource::collection($query->latest('placed_at')->paginate($perPage));
    }

    public function store(StoreOrderRequest $request): JsonResponse
    {
        Gate::authorize('manage-orders');

        $validated = $request->validated();
        $data = collect($validated)->except('items')->all();
        $data['items'] = $this->transformItems($validated['items']);

        $order = $this->orderPlacementService->place($data, $request->user()->id);

        $this->auditLogService->log('order.created', $order, null, $order->toArray(), 'Order created.', $request);

        return (new OrderResource($this->loadOrder($order)))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Order $order): OrderResource
    {
        Gate::authorize('view-order', $order);

        return new OrderResource($this->loadOrder($order));
    }

    public function update(UpdateOrderRequest $request, Order $order): OrderResource
    {
        $this->authorizeUpdate($request, $order);
        $before = $order->load('items')->toArray();

        $this->ensureOrderIsMutable($order);

        DB::transaction(function () use ($request, $order) {
            $data = collect($request->validated())->except('items')->all();
            $data['modified_by'] = $request->user()->id;
            $this->applyStatusTransition($order, $data);
            $order->update($data);

            if ($request->has('items')) {
                if ($order->inventory_deducted_at && ! $order->inventory_restored_at) {
                    $this->orderInventoryService->restoreForOrder(
                        $order->fresh('items.product.recipeItems.ingredient'),
                        $request->user()->id,
                        reasonType: 'VARIANCE',
                        reason: "Order {$order->order_number} updated before payment",
                    );
                }

                $order->items()->delete();
                $order->items()->createMany($this->transformItems($request->validated('items')));
                $order->forceFill([
                    'inventory_deducted_at' => null,
                    'inventory_restored_at' => null,
                ])->save();
            }

            $this->syncTotals($order);

            if ($request->has('items')) {
                $this->orderInventoryService->deductForOrder(
                    $order->fresh('items.product.recipeItems.ingredient'),
                    $request->user()->id,
                    reason: "Order {$order->order_number} updated before payment",
                    force: true,
                );
            }
        });

        $fresh = $this->loadOrder($order->fresh());
        $this->auditLogService->log('order.updated', $order, $before, $fresh->toArray(), 'Order updated.', $request);

        return new OrderResource($fresh);
    }

    public function destroy(Request $request, Order $order): JsonResponse
    {
        Gate::authorize('manager-access');
        $this->ensureOrderCanBeReversed($order, 'Deleted');
        $before = $order->toArray();
        DB::transaction(function () use ($order, $request) {
            $this->orderInventoryService->restoreForOrder(
                $order->fresh('items.product.recipeItems.ingredient'),
                $request->user()->id,
                reasonType: 'VOID',
                reason: "Order {$order->order_number} deleted before payment",
            );
            $order->delete();
        });
        $this->auditLogService->log('order.deleted', $order, $before, null, 'Order deleted.', $request);

        return response()->json([], 204);
    }

    public function capturePayment(CapturePaymentRequest $request, Order $order): OrderResource
    {
        Gate::authorize('manage-orders');
        $this->ensureOrderIsMutable($order);
        $paidOrder = $this->checkoutService->checkout($order, $request->validated(), $request->user()->id);
        $this->auditLogService->log('order.payment-captured', $order, null, $paidOrder->toArray(), 'Order payment captured.', $request);

        return new OrderResource($paidOrder);
    }

    public function cancel(Request $request, Order $order): OrderResource
    {
        Gate::authorize('manage-orders');
        $request->validate(['reason' => ['required', 'string']]);
        $this->ensureOrderCanBeReversed($order, 'Cancelled');

        $before = $order->toArray();
        DB::transaction(function () use ($order, $request) {
            $this->orderInventoryService->restoreForOrder(
                $order->fresh('items.product.recipeItems.ingredient'),
                $request->user()->id,
                reasonType: 'VOID',
                reason: "Order {$order->order_number} cancelled before payment",
            );

            $order->forceFill([
                'status' => 'CANCELLED',
                'cancelled_at' => now(),
                'modified_by' => $request->user()->id,
            ])->save();
        });

        $this->auditLogService->log('order.cancelled', $order, $before, $order->fresh()->toArray(), $request->string('reason')->toString(), $request);

        return new OrderResource($this->loadOrder($order->fresh()));
    }

    public function void(Request $request, Order $order): OrderResource
    {
        Gate::authorize('manager-access');
        $request->validate(['reason' => ['required', 'string']]);
        $this->ensureOrderCanBeReversed($order, 'Voided');

        $before = $order->toArray();
        DB::transaction(function () use ($order, $request) {
            $this->orderInventoryService->restoreForOrder(
                $order->fresh('items.product.recipeItems.ingredient'),
                $request->user()->id,
                reasonType: 'VOID',
                reason: "Order {$order->order_number} voided before payment",
            );

            $order->forceFill([
                'status' => 'CANCELLED',
                'cancelled_at' => now(),
                'modified_by' => $request->user()->id,
            ])->save();
        });

        $this->auditLogService->log('order.voided', $order, $before, $order->fresh()->toArray(), $request->string('reason')->toString(), $request);

        return new OrderResource($this->loadOrder($order->fresh()));
    }

    public function receipt(Order $order): JsonResponse
    {
        Gate::authorize('manage-orders');
        $loaded = $this->loadOrder($order);

        return response()->json([
            'data' => [
                'order' => OrderResource::make($loaded),
                'generated_at' => Carbon::now()->toIso8601String(),
                'receipt_lines' => [
                    'Restaurant POS',
                    'Receipt No: '.$loaded->order_number,
                    'Total: '.number_format((float) $loaded->total_amount, 2),
                ],
            ],
        ]);
    }

    private function transformItems(array $items): array
    {
        return collect($items)->map(fn (array $item) => [
            'product_id' => $item['product_id'] ?? null,
            'name' => $item['name'],
            'unit_price' => $item['price'],
            'quantity' => $item['quantity'],
            'line_subtotal' => round($item['price'] * $item['quantity'], 2),
            'modifiers' => $item['modifiers'] ?? [],
            'note' => $item['note'] ?? null,
            'bundle_items' => $item['bundle_items'] ?? [],
        ])->all();
    }

    private function syncTotals(Order $order): void
    {
        $order->load('items', 'discount');
        $discount = $order->discount_id ? Discount::find($order->discount_id) : null;
        $this->checkoutService->syncOrderTotals($order, $discount);
    }

    private function loadOrder(Order $order): Order
    {
        return $order->load(['items', 'payments.receivedBy.role', 'processedBy.role', 'modifiedBy.role', 'table', 'customer', 'discount']);
    }

    private function authorizeUpdate(Request $request, Order $order): void
    {
        if ($request->user()?->hasAnyRole(['admin', 'manager', 'cashier'])) {
            Gate::authorize('manage-orders');
            return;
        }

        Gate::authorize('update-kitchen-orders');

        if ($request->hasAny(['customer_id', 'restaurant_table_id', 'discount_id', 'order_type', 'note', 'items'])) {
            throw new HttpException(403, 'Kitchen users may only update kitchen workflow statuses.');
        }

        $status = $request->input('status');

        if (! in_array($status, ['PREPARING', 'READY_FOR_PICKUP', 'COMPLETED'], true)) {
            throw new HttpException(403, 'Kitchen users may only move orders through kitchen statuses.');
        }

        $this->assertValidStatusTransition($order->status, $status);
    }

    private function ensureOrderIsMutable(Order $order): void
    {
        if (in_array($order->status, ['COMPLETED', 'CANCELLED'], true)) {
            throw new HttpException(422, 'Completed or cancelled orders can no longer be modified directly.');
        }
    }

    private function ensureOrderCanBeReversed(Order $order, string $action): void
    {
        if ($order->payments()->exists() || in_array($order->status, ['PAID', 'COMPLETED'], true)) {
            throw new HttpException(422, "{$action} paid or completed orders is not supported until refund and inventory reversal flows are implemented.");
        }
    }

    private function applyStatusTransition(Order $order, array &$data): void
    {
        if (! array_key_exists('status', $data) || $data['status'] === $order->status) {
            return;
        }

        $nextStatus = $data['status'];

        $this->assertValidStatusTransition($order->status, $nextStatus);

        if ($nextStatus === 'SENT_TO_KITCHEN' && ! $order->kitchen_sent_at) {
            $data['kitchen_sent_at'] = now();
        }

        if ($nextStatus === 'PREPARING') {
            $data['kitchen_sent_at'] ??= $order->kitchen_sent_at ?? now();
            $data['kitchen_started_at'] = $order->kitchen_started_at ?? now();
        }

        if ($nextStatus === 'READY_FOR_PICKUP') {
            $data['kitchen_sent_at'] ??= $order->kitchen_sent_at ?? now();
            $data['kitchen_started_at'] ??= $order->kitchen_started_at ?? now();
            $data['kitchen_ready_at'] = $order->kitchen_ready_at ?? now();
        }

        if ($nextStatus === 'COMPLETED') {
            $data['completed_at'] = $order->completed_at ?? now();
        }
    }

    private function assertValidStatusTransition(string $currentStatus, string $nextStatus): void
    {
        if ($currentStatus === $nextStatus) {
            return;
        }

        $allowedTransitions = [
            'PENDING_PAYMENT' => ['HOLD', 'SENT_TO_KITCHEN', 'PREPARING', 'CANCELLED'],
            'HOLD' => ['PENDING_PAYMENT', 'SENT_TO_KITCHEN', 'PREPARING', 'CANCELLED'],
            'PAID' => ['SENT_TO_KITCHEN', 'PREPARING', 'READY_FOR_PICKUP', 'COMPLETED'],
            'SENT_TO_KITCHEN' => ['PREPARING', 'READY_FOR_PICKUP', 'COMPLETED'],
            'PREPARING' => ['READY_FOR_PICKUP', 'COMPLETED'],
            'READY_FOR_PICKUP' => ['COMPLETED'],
            'COMPLETED' => [],
            'CANCELLED' => [],
        ];

        if (! in_array($nextStatus, $allowedTransitions[$currentStatus] ?? [], true)) {
            throw new HttpException(422, "Invalid order status transition from {$currentStatus} to {$nextStatus}.");
        }
    }
}
