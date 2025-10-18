<?php

namespace App\Actions\Tenant;

use App\Exceptions\BusinessException;
use App\Models\Tenant;

class DeleteTenantAction
{
    public function execute(Tenant $tenant): bool
    {
        if ($tenant->users()->count() > 0) {
            throw new BusinessException('Cannot delete tenant with associated users');
        }

        if ($tenant->news()->count() > 0) {
            throw new BusinessException('Cannot delete tenant with associated news');
        }

        return $tenant->delete();
    }
}
