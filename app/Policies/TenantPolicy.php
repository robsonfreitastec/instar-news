<?php

namespace App\Policies;

use App\Models\Tenant;
use App\Models\User;

class TenantPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isSuperAdmin();
    }

    public function view(User $user, Tenant $tenant): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return $user->belongsToTenant($tenant->id);
    }

    public function create(User $user): bool
    {
        return $user->isSuperAdmin();
    }

    public function update(User $user, Tenant $tenant): bool
    {
        return $user->isSuperAdmin();
    }

    public function delete(User $user, Tenant $tenant): bool
    {
        return $user->isSuperAdmin();
    }
}
