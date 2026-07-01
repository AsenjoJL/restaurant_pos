<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\RoleResource;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

class RoleController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        Gate::authorize('manage-users');

        return RoleResource::collection(Role::query()->orderBy('name')->paginate((int) $request->integer('per_page', 25)));
    }
}
