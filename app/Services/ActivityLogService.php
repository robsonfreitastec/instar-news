<?php

namespace App\Services;

use App\Exceptions\NotFoundException;
use App\Exceptions\UnauthorizedException;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;

class ActivityLogService
{
    public function getAll(
        User $currentUser,
        ?string $tenantUuid = null,
        ?string $userUuid = null,
        ?string $logType = null,
        ?string $modelType = null,
        int $perPage = 20
    ): LengthAwarePaginator {
        if (! $currentUser->isSuperAdmin()) {
            throw new UnauthorizedException('Only Super Admin can view logs.');
        }

        $query = ActivityLog::with(['user', 'tenant'])
            ->orderBy('created_at', 'desc');

        if ($tenantUuid) {
            $tenant = \App\Models\Tenant::where('uuid', $tenantUuid)->first();
            if ($tenant) {
                $query->where('tenant_id', $tenant->id);
            }
        }

        if ($userUuid) {
            $user = User::where('uuid', $userUuid)->first();
            if ($user) {
                $query->where('user_id', $user->id);
            }
        }

        if ($logType) {
            $query->where('log_type', $logType);
        }

        if ($modelType) {
            $query->where('model_type', $modelType);
        }

        return $query->paginate($perPage);
    }

    public function getByUuid(string $uuid, User $currentUser): ActivityLog
    {
        if (! $currentUser->isSuperAdmin()) {
            throw new UnauthorizedException('Only Super Admin can view logs.');
        }

        $log = ActivityLog::with(['user', 'tenant'])
            ->where('uuid', $uuid)
            ->first();

        if (! $log) {
            throw new NotFoundException('Log not found');
        }

        return $log;
    }
}
