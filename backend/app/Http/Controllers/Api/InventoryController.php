<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Inventory\StoreInventoryRequest;
use App\Http\Requests\Inventory\UpdateInventoryRequest;
use App\Http\Resources\InventoryResource;
use App\Models\Inventory;
use App\Services\AuditLogService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

class InventoryController extends Controller
{
    public function __construct(private readonly AuditLogService $auditLogService) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Inventory::query()->with(['product.category', 'supplier']);
        $perPage = min(max((int) $request->integer('per_page', 15), 1), 500);

        if ($request->boolean('low_stock')) {
            $query->whereColumn('quantity_on_hand', '<=', 'reorder_level');
        }

        return InventoryResource::collection($query->orderBy('product_id')->paginate($perPage));
    }

    public function store(StoreInventoryRequest $request): InventoryResource
    {
        Gate::authorize('manager-access');
        $inventory = Inventory::create($request->validated());
        $this->auditLogService->log('inventory.created', $inventory, null, $inventory->toArray(), 'Inventory item created.', $request);

        return new InventoryResource($inventory->load(['product', 'supplier']));
    }

    public function show(Inventory $inventory): InventoryResource
    {
        return new InventoryResource($inventory->load(['product.category', 'supplier']));
    }

    public function update(UpdateInventoryRequest $request, Inventory $inventory): InventoryResource
    {
        Gate::authorize('manager-access');
        $before = $inventory->toArray();
        $inventory->update($request->validated());
        $this->auditLogService->log('inventory.updated', $inventory, $before, $inventory->fresh()->toArray(), 'Inventory item updated.', $request);

        return new InventoryResource($inventory->fresh()->load(['product', 'supplier']));
    }

    public function destroy(Request $request, Inventory $inventory): \Illuminate\Http\JsonResponse
    {
        Gate::authorize('manager-access');
        $before = $inventory->toArray();
        $inventory->delete();
        $this->auditLogService->log('inventory.deleted', $inventory, $before, null, 'Inventory item deleted.', $request);

        return response()->json([], 204);
    }
}
