<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class AuditLogService
{
    public function log(
        ?string $event,
        ?Model $auditable = null,
        ?array $oldValues = null,
        ?array $newValues = null,
        ?string $message = null,
        ?Request $request = null,
        ?string $userId = null,
    ): AuditLog {
        return AuditLog::create([
            'user_id' => $userId ?? $request?->user()?->id,
            'event' => $event ?? 'unknown',
            'auditable_type' => $auditable ? $auditable::class : null,
            'auditable_id' => $auditable?->getKey(),
            'ip_address' => $request?->ip(),
            'user_agent' => $request?->userAgent(),
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'message' => $message,
        ]);
    }
}
