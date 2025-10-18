<?php

namespace App\Services;

use App\Actions\Tenant\DeleteTenantAction;
use App\Actions\Tenant\RegisterTenantAction;
use App\Actions\Tenant\UpdateTenantAction;
use App\Actions\TenantUser\AttachUserToTenantAction;
use App\Actions\TenantUser\DetachUserFromTenantAction;
use App\DTO\Tenant\TenantData;
use App\Exceptions\NotFoundException;
use App\Exceptions\UnauthorizedException;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class TenantService
{
    public function __construct(
        private readonly RegisterTenantAction $registerTenantAction,
        private readonly UpdateTenantAction $updateTenantAction,
        private readonly DeleteTenantAction $deleteTenantAction,
        private readonly AttachUserToTenantAction $attachUserAction,
        private readonly DetachUserFromTenantAction $detachUserAction,
    ) {}

    public function getAll(User $currentUser, ?string $search = null, int $perPage = 15): LengthAwarePaginator
    {
        if (! $currentUser->isSuperAdmin()) {
            throw new UnauthorizedException('Only Super Admin can list tenants.');
        }

        $query = Tenant::with('users');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ILIKE', "%{$search}%")
                    ->orWhere('domain', 'ILIKE', "%{$search}%");
            });
        }

        return $query->paginate($perPage);
    }

    public function getByUuid(string $uuid, User $currentUser): Tenant
    {
        $tenant = Tenant::with('users')->where('uuid', $uuid)->first();

        if (! $tenant) {
            throw new NotFoundException('Tenant not found');
        }

        if (! $currentUser->isSuperAdmin() && ! $currentUser->belongsToTenant($tenant->id)) {
            throw new UnauthorizedException('You do not have permission to view this tenant.');
        }

        return $tenant;
    }

    public function findByUuid(string $uuid): ?Tenant
    {
        return Tenant::where('uuid', $uuid)->first();
    }

    public function create(array $data, User $currentUser): Tenant
    {
        if (! $currentUser->isSuperAdmin()) {
            throw new UnauthorizedException('Only Super Admin can create tenants.');
        }

        $tenantData = TenantData::fromArray($data);

        return $this->registerTenantAction->execute($tenantData);
    }

    public function update(Tenant $tenant, array $data, User $currentUser): Tenant
    {
        if (! $currentUser->isSuperAdmin()) {
            throw new UnauthorizedException('Only Super Admin can update tenants.');
        }

        return $this->updateTenantAction->execute($tenant, $data);
    }

    public function delete(Tenant $tenant, User $currentUser): bool
    {
        if (! $currentUser->isSuperAdmin()) {
            throw new UnauthorizedException('Only Super Admin can delete tenants.');
        }

        return $this->deleteTenantAction->execute($tenant);
    }

    public function attachUser(Tenant $tenant, User $user, string $role, User $currentUser): Tenant
    {
        if (! $currentUser->isSuperAdmin()) {
            throw new UnauthorizedException('Only Super Admin can add users to tenants.');
        }

        return $this->attachUserAction->execute($tenant, $user, $role);
    }

    public function detachUser(Tenant $tenant, User $user, User $currentUser): Tenant
    {
        if (! $currentUser->isSuperAdmin()) {
            throw new UnauthorizedException('Only Super Admin can remove users from tenants.');
        }

        return $this->detachUserAction->execute($tenant, $user);
    }

    public function attachUserByUuids(string $tenantUuid, string $userUuid, string $role, User $currentUser): Tenant
    {
        $tenant = $this->findByUuid($tenantUuid);

        if (! $tenant) {
            throw new NotFoundException('Tenant not found');
        }

        $user = User::where('uuid', $userUuid)->first();

        if (! $user) {
            throw new NotFoundException('User not found');
        }

        return $this->attachUser($tenant, $user, $role, $currentUser);
    }

    public function detachUserByUuids(string $tenantUuid, string $userUuid, User $currentUser): Tenant
    {
        $tenant = $this->findByUuid($tenantUuid);

        if (! $tenant) {
            throw new NotFoundException('Tenant not found');
        }

        $user = User::where('uuid', $userUuid)->first();

        if (! $user) {
            throw new NotFoundException('User not found');
        }

        return $this->detachUser($tenant, $user, $currentUser);
    }
}
