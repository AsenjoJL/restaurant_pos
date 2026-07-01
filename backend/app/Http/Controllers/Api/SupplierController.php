<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Supplier\StoreSupplierRequest;
use App\Http\Requests\Supplier\UpdateSupplierRequest;
use App\Http\Resources\SupplierResource;
use App\Models\Supplier;
use App\Services\AuditLogService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

class SupplierController extends Controller
{
    public function __construct(private readonly AuditLogService $auditLogService) {}
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Supplier::query();
        if ($search = $request->string('search')->toString()) {
            $query->where('name', 'like', "%{$search}%");
        }

        return SupplierResource::collection($query->orderBy('name')->paginate((int) $request->integer('per_page', 15)));
    }
    public function store(StoreSupplierRequest $request): SupplierResource
    {
        Gate::authorize('manager-access');
        $supplier = Supplier::create($request->validated());
        $this->auditLogService->log('supplier.created', $supplier, null, $supplier->toArray(), 'Supplier created.', $request);
        return new SupplierResource($supplier);
    }
    public function show(Supplier $supplier): SupplierResource { return new SupplierResource($supplier); }
    public function update(UpdateSupplierRequest $request, Supplier $supplier): SupplierResource
    {
        Gate::authorize('manager-access');
        $before = $supplier->toArray();
        $supplier->update($request->validated());
        $this->auditLogService->log('supplier.updated', $supplier, $before, $supplier->fresh()->toArray(), 'Supplier updated.', $request);
        return new SupplierResource($supplier->fresh());
    }
    public function destroy(Request $request, Supplier $supplier): \Illuminate\Http\JsonResponse
    {
        Gate::authorize('manager-access');
        $before = $supplier->toArray();
        $supplier->delete();
        $this->auditLogService->log('supplier.deleted', $supplier, $before, null, 'Supplier deleted.', $request);
        return response()->json([], 204);
    }
}
