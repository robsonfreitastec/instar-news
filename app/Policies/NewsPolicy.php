<?php

namespace App\Policies;

use App\Models\News;
use App\Models\User;

class NewsPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, News $news): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return $user->belongsToTenant($news->tenant_id);
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, News $news): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        if (! $user->belongsToTenant($news->tenant_id)) {
            return false;
        }

        return true;
    }

    public function delete(User $user, News $news): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        if (! $user->belongsToTenant($news->tenant_id)) {
            return false;
        }

        $role = $user->roleInTenant($news->tenant_id);

        return $role === 'admin';
    }
}
