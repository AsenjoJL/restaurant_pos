<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Discount\StoreDiscountRequest;
use App\Http\Requests\Discount\UpdateDiscountRequest;
use App\Http\Resources\DiscountResource;
use App\Models\Discount;
use App\Services\AuditLogService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

class DiscountController extends Controller
{
    public function __construct(private readonly AuditLogService $auditLogService) {}
    public function index(Request $request): AnonymousResourceCollection
    {
        return DiscountResource::collection(Discount::query()->orderByDesc('created_at')->paginate((int) $request->integer('per_page', 15)));
    }
    public function store(StoreDiscountRequest $request): DiscountResource
    {
        Gate::authorize('manager-access');
        $discount = Discount::create($request->validated());
        $this->auditLogService->log('discount.created', $discount, null, $discount->toArray(), 'Discount created.', $request);
        return new DiscountResource($discount);
    }
    public function show(Discount $discount): DiscountResource { return new DiscountResource($discount); }
    public function update(UpdateDiscountRequest $request, Discount $discount): DiscountResource
    {
        Gate::authorize('manager-access');
        $before = $discount->toArray();
        $discount->update($request->validated());
        $this->auditLogService->log('discount.updated', $discount, $before, $discount->fresh()->toArray(), 'Discount updated.', $request);
        return new DiscountResource($discount->fresh());
    }
    public function destroy(Request $request, Discount $discount): \Illuminate\Http\JsonResponse
    {
        Gate::authorize('manager-access');
        $before = $discount->toArray();
        $discount->delete();
        $this->auditLogService->log('discount.deleted', $discount, $before, null, 'Discount deleted.', $request);
        return response()->json([], 204);
    }
}
