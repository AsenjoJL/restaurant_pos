<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Setting\UpdateSettingRequest;
use App\Http\Resources\SettingResource;
use App\Models\Setting;
use App\Services\AuditLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

class SettingController extends Controller
{
    public function __construct(private readonly AuditLogService $auditLogService) {}
    public function index(Request $request): AnonymousResourceCollection
    {
        return SettingResource::collection(Setting::query()->orderBy('group')->orderBy('key')->paginate((int) $request->integer('per_page', 50)));
    }
    public function store(UpdateSettingRequest $request): JsonResponse
    {
        return $this->update($request, new Setting());
    }
    public function update(UpdateSettingRequest $request, Setting $setting): JsonResponse
    {
        Gate::authorize('manage-settings');
        foreach ($request->validated('settings') as $entry) {
            Setting::updateOrCreate(
                ['group' => $entry['group'], 'key' => $entry['key']],
                ['value' => ['value' => $entry['value']]]
            );
        }
        $this->auditLogService->log('settings.updated', null, null, $request->validated(), 'Settings updated.', $request);
        return response()->json(['data' => SettingResource::collection(Setting::query()->orderBy('group')->orderBy('key')->get())]);
    }
}
