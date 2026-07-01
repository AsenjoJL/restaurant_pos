<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AuditLogResource;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

class AuditLogController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        Gate::authorize('manager-access');
        return AuditLogResource::collection(AuditLog::query()->with('user.role')->latest()->paginate((int) $request->integer('per_page', 25)));
    }

    public function show(AuditLog $auditLog): AuditLogResource
    {
        Gate::authorize('manager-access');
        return new AuditLogResource($auditLog->load('user.role'));
    }
}
