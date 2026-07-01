<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PurchaseOrder\StorePurchaseOrderRequest;
use App\Http\Requests\PurchaseOrder\UpdatePurchaseOrderRequest;
use App\Http\Resources\PurchaseOrderResource;
use App\Models\Inventory;
use App\Models\PurchaseOrder;
use App\Services\AuditLogService;
use App\Services\InventoryAdjustmentService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Symfony\Component\HttpKernel\Exception\HttpException;

class PurchaseOrderController extends Controller
{
    private const MAX_PER_PAGE = 250;

    public function __construct(
        private readonly AuditLogService $auditLogService,
        private readonly InventoryAdjustmentService $inventoryAdjustmentService,
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        Gate::authorize('manage-purchase-orders');

        $query = PurchaseOrder::query()->with(['supplier', 'createdBy.role', 'items.product']);

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        $perPage = min(max((int) $request->integer('per_page', 15), 1), self::MAX_PER_PAGE);

        return PurchaseOrderResource::collection($query->latest()->paginate($perPage));
    }

    public function store(StorePurchaseOrderRequest $request): PurchaseOrderResource
    {
        Gate::authorize('manage-purchase-orders');

        $purchaseOrder = DB::transaction(function () use ($request) {
            $data = collect($request->validated())->except('items')->all();
            $items = $request->validated('items');
            [$subtotal, $taxAmount, $totalAmount] = $this->totals($items);

            $purchaseOrder = PurchaseOrder::create([
                ...$data,
                'created_by' => $request->user()->id,
                'po_number' => $this->nextPurchaseOrderNumber(),
                'subtotal' => $subtotal,
                'tax_amount' => $taxAmount,
                'total_amount' => $totalAmount,
            ]);

            $purchaseOrder->items()->createMany($this->transformItems($items));
            $this->applyReceiving($purchaseOrder->fresh('items'));

            return $purchaseOrder;
        });

        $this->auditLogService->log('purchase-order.created', $purchaseOrder, null, $purchaseOrder->toArray(), 'Purchase order created.', $request);

        return new PurchaseOrderResource($purchaseOrder->load(['supplier', 'createdBy.role', 'items.product']));
    }

    public function show(PurchaseOrder $purchaseOrder): PurchaseOrderResource
    {
        Gate::authorize('manage-purchase-orders');

        return new PurchaseOrderResource($purchaseOrder->load(['supplier', 'createdBy.role', 'items.product']));
    }

    public function update(UpdatePurchaseOrderRequest $request, PurchaseOrder $purchaseOrder): PurchaseOrderResource
    {
        Gate::authorize('manage-purchase-orders');
        $before = $purchaseOrder->load('items')->toArray();

        DB::transaction(function () use ($request, $purchaseOrder) {
            $wasInventoryApplied = $purchaseOrder->received_inventory_applied_at !== null;
            $data = collect($request->validated())->except('items')->all();
            $items = $request->validated('items', []);

            if ($wasInventoryApplied && $this->mutatesReceivedInventory($purchaseOrder, $data, $items)) {
                throw new HttpException(
                    422,
                    'Received purchase orders cannot change status, supplier, received date, or line items after inventory has been applied.'
                );
            }

            if ($items !== []) {
                [$subtotal, $taxAmount, $totalAmount] = $this->totals($items);
                $data['subtotal'] = $subtotal;
                $data['tax_amount'] = $taxAmount;
                $data['total_amount'] = $totalAmount;
            }

            $purchaseOrder->update($data);

            if ($items !== []) {
                $purchaseOrder->items()->delete();
                $purchaseOrder->items()->createMany($this->transformItems($items));
            }

            $this->applyReceiving($purchaseOrder->fresh('items'));
        });

        $fresh = $purchaseOrder->fresh()->load(['supplier', 'createdBy.role', 'items.product']);
        $this->auditLogService->log('purchase-order.updated', $purchaseOrder, $before, $fresh->toArray(), 'Purchase order updated.', $request);

        return new PurchaseOrderResource($fresh);
    }

    public function destroy(Request $request, PurchaseOrder $purchaseOrder): \Illuminate\Http\JsonResponse
    {
        Gate::authorize('manage-purchase-orders');

        if ($purchaseOrder->received_inventory_applied_at !== null) {
            throw new HttpException(422, 'Received purchase orders cannot be deleted after inventory has been applied.');
        }

        $before = $purchaseOrder->toArray();
        $purchaseOrder->delete();
        $this->auditLogService->log('purchase-order.deleted', $purchaseOrder, $before, null, 'Purchase order deleted.', $request);

        return response()->json([], 204);
    }

    private function totals(array $items): array
    {
        $subtotal = collect($items)->sum(fn (array $item) => $item['quantity'] * $item['unit_cost']);
        $taxAmount = round($subtotal * 0.12, 2);

        return [round($subtotal, 2), $taxAmount, round($subtotal + $taxAmount, 2)];
    }

    private function transformItems(array $items): array
    {
        return collect($items)->map(fn (array $item) => [
            'product_id' => $item['product_id'],
            'quantity' => $item['quantity'],
            'unit_cost' => $item['unit_cost'],
            'line_total' => round($item['quantity'] * $item['unit_cost'], 2),
        ])->all();
    }

    private function applyReceiving(PurchaseOrder $purchaseOrder): void
    {
        if (
            $purchaseOrder->status !== 'RECEIVED' ||
            ! $purchaseOrder->received_at ||
            $purchaseOrder->received_inventory_applied_at !== null
        ) {
            return;
        }

        foreach ($purchaseOrder->items as $item) {
            $inventory = Inventory::firstOrCreate(
                ['product_id' => $item->product_id],
                ['supplier_id' => $purchaseOrder->supplier_id, 'quantity_on_hand' => 0, 'reorder_level' => 0, 'unit_cost' => $item->unit_cost, 'unit' => 'pcs']
            );

            $inventory->forceFill([
                'supplier_id' => $purchaseOrder->supplier_id,
                'unit_cost' => $item->unit_cost,
            ])->save();

            $this->inventoryAdjustmentService->record(
                $inventory,
                type: 'IN',
                reasonType: 'RESTOCK',
                qty: (float) $item->quantity,
                reason: "Purchase order {$purchaseOrder->po_number} received",
                reference: $purchaseOrder->po_number,
                userId: $purchaseOrder->created_by,
            );
        }

        $purchaseOrder->forceFill([
            'received_inventory_applied_at' => now(),
        ])->save();
    }

    private function mutatesReceivedInventory(PurchaseOrder $purchaseOrder, array $data, array $items): bool
    {
        if ($items !== []) {
            return true;
        }

        if (array_key_exists('supplier_id', $data) && $data['supplier_id'] !== $purchaseOrder->supplier_id) {
            return true;
        }

        if (array_key_exists('status', $data) && $data['status'] !== $purchaseOrder->status) {
            return true;
        }

        if (array_key_exists('received_at', $data) && $data['received_at'] !== optional($purchaseOrder->received_at)?->toDateString()) {
            return true;
        }

        return false;
    }

    private function nextPurchaseOrderNumber(): string
    {
        return 'PO-'.now()->format('YmdHis').'-'.Str::upper(Str::random(4));
    }
}
