<?php

namespace App\Actions\Tenant;

use App\DTO\Tenant\TenantData;
use App\Models\Tenant;

class RegisterTenantAction
{
    public function execute(TenantData $data): Tenant
    {
        return Tenant::create($data->toArray());
    }
}
