<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\AuditLogService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

class UserController extends Controller
{
    private const MAX_PER_PAGE = 250;

    public function __construct(private readonly AuditLogService $auditLogService) {}
    public function index(Request $request): AnonymousResourceCollection
    {
        Gate::authorize('manage-users');
        $perPage = min(max((int) $request->integer('per_page', 15), 1), self::MAX_PER_PAGE);

        return UserResource::collection(User::query()->with('role')->orderBy('name')->paginate($perPage));
    }
    public function store(StoreUserRequest $request): UserResource
    {
        Gate::authorize('manage-users');
        $user = User::create($request->validated());
        $this->auditLogService->log('user.created', $user, null, $user->toArray(), 'User created.', $request);
        return new UserResource($user->load('role'));
    }
    public function show(User $user): UserResource
    {
        Gate::authorize('manage-users');
        return new UserResource($user->load('role'));
    }
    public function update(UpdateUserRequest $request, User $user): UserResource
    {
        Gate::authorize('manage-users');
        $before = $user->toArray();
        $data = $request->validated();
        if (empty($data['password'])) {
            unset($data['password']);
        }
        $user->update($data);
        $this->auditLogService->log('user.updated', $user, $before, $user->fresh()->toArray(), 'User updated.', $request);
        return new UserResource($user->fresh()->load('role'));
    }
    public function destroy(Request $request, User $user): \Illuminate\Http\JsonResponse
    {
        Gate::authorize('manage-users');
        $before = $user->toArray();
        $user->delete();
        $this->auditLogService->log('user.deleted', $user, $before, null, 'User deleted.', $request);
        return response()->json([], 204);
    }
}
