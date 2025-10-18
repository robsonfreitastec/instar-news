<?php

namespace App\Actions\TenantUser;

use App\Models\Tenant;
use App\Models\User;

class AttachUserToTenantAction
{
    public function execute(Tenant $tenant, User $user, string $role): Tenant
    {
        $tenant->users()->syncWithoutDetaching([
            $user->id => ['role' => $role],
        ]);

        return $tenant->fresh()->load('users');
    }
}
