<?php

namespace App\Actions\TenantUser;

use App\Models\Tenant;
use App\Models\User;

class DetachUserFromTenantAction
{
    public function execute(Tenant $tenant, User $user): Tenant
    {
        $tenant->users()->detach($user->id);

        return $tenant->fresh()->load('users');
    }
}
