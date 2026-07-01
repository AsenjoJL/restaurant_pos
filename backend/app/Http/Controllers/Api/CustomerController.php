<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\StoreCustomerRequest;
use App\Http\Requests\Customer\UpdateCustomerRequest;
use App\Http\Resources\CustomerResource;
use App\Models\Customer;
use App\Services\AuditLogService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CustomerController extends Controller
{
    public function __construct(private readonly AuditLogService $auditLogService) {}
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Customer::query();
        if ($search = $request->string('search')->toString()) {
            $query->where('name', 'like', "%{$search}%");
        }
        return CustomerResource::collection($query->orderBy('name')->paginate((int) $request->integer('per_page', 15)));
    }
    public function store(StoreCustomerRequest $request): CustomerResource
    {
        $customer = Customer::create($request->validated());
        $this->auditLogService->log('customer.created', $customer, null, $customer->toArray(), 'Customer created.', $request);
        return new CustomerResource($customer);
    }
    public function show(Customer $customer): CustomerResource { return new CustomerResource($customer); }
    public function update(UpdateCustomerRequest $request, Customer $customer): CustomerResource
    {
        $before = $customer->toArray();
        $customer->update($request->validated());
        $this->auditLogService->log('customer.updated', $customer, $before, $customer->fresh()->toArray(), 'Customer updated.', $request);
        return new CustomerResource($customer->fresh());
    }
    public function destroy(Request $request, Customer $customer): \Illuminate\Http\JsonResponse
    {
        $before = $customer->toArray();
        $customer->delete();
        $this->auditLogService->log('customer.deleted', $customer, $before, null, 'Customer deleted.', $request);
        return response()->json([], 204);
    }
}
