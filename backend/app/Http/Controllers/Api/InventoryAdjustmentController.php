<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Inventory\StoreInventoryAdjustmentRequest;
use App\Http\Resources\InventoryAdjustmentResource;
use App\Models\InventoryAdjustment;
use App\Services\AuditLogService;
use App\Services\InventoryAdjustmentService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

class InventoryAdjustmentController extends Controller
{
    public function __construct(
        private readonly InventoryAdjustmentService $inventoryAdjustmentService,
        private readonly AuditLogService $auditLogService,
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        Gate::authorize('cashier-access');

        $query = InventoryAdjustment::query();
        $perPage = min(max((int) $request->integer('per_page', 50), 1), 200);

        if ($request->filled('product_id')) {
            $query->where('product_id', $request->string('product_id'));
        }

        if ($request->filled('order_id')) {
            $query->where('order_id', $request->string('order_id'));
        }

        if ($request->filled('reason_type')) {
            $query->where('reason_type', $request->string('reason_type'));
        }

        return InventoryAdjustmentResource::collection(
            $query->latest('adjusted_at')->paginate($perPage)
        );
    }

    public function store(StoreInventoryAdjustmentRequest $request): InventoryAdjustmentResource
    {
        Gate::authorize('manager-access');

        $adjustment = $this->inventoryAdjustmentService->applyByProductId(
            productId: $request->validated('product_id'),
            payload: $request->validated(),
            userId: $request->user()?->id,
        );

        $this->auditLogService->log(
            'inventory.adjusted',
            $adjustment,
            null,
            $adjustment->toArray(),
            'Inventory adjustment recorded.',
            $request
        );

        return new InventoryAdjustmentResource($adjustment);
    }
}
