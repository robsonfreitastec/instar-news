<?php

namespace App\Actions\User;

use App\Models\User;

class AttachUserToTenantAction
{
    public function execute(User $user, int $tenantId, string $role): User
    {
        $user->tenants()->attach($tenantId, ['role' => $role]);

        return $user->fresh()->load('tenants');
    }
}

