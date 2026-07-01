<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\RestaurantTable\StoreRestaurantTableRequest;
use App\Http\Requests\RestaurantTable\UpdateRestaurantTableRequest;
use App\Http\Resources\RestaurantTableResource;
use App\Models\RestaurantTable;
use App\Services\AuditLogService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

class RestaurantTableController extends Controller
{
    public function __construct(private readonly AuditLogService $auditLogService) {}
    public function index(Request $request): AnonymousResourceCollection
    {
        return RestaurantTableResource::collection(RestaurantTable::query()->orderBy('name')->paginate((int) $request->integer('per_page', 15)));
    }
    public function store(StoreRestaurantTableRequest $request): RestaurantTableResource
    {
        Gate::authorize('manager-access');
        $table = RestaurantTable::create($request->validated());
        $this->auditLogService->log('table.created', $table, null, $table->toArray(), 'Restaurant table created.', $request);
        return new RestaurantTableResource($table);
    }
    public function show(RestaurantTable $table): RestaurantTableResource { return new RestaurantTableResource($table); }
    public function update(UpdateRestaurantTableRequest $request, RestaurantTable $table): RestaurantTableResource
    {
        Gate::authorize('manager-access');
        $before = $table->toArray();
        $table->update($request->validated());
        $this->auditLogService->log('table.updated', $table, $before, $table->fresh()->toArray(), 'Restaurant table updated.', $request);
        return new RestaurantTableResource($table->fresh());
    }
    public function destroy(Request $request, RestaurantTable $table): \Illuminate\Http\JsonResponse
    {
        Gate::authorize('manager-access');
        $before = $table->toArray();
        $table->delete();
        $this->auditLogService->log('table.deleted', $table, $before, null, 'Restaurant table deleted.', $request);
        return response()->json([], 204);
    }
}
