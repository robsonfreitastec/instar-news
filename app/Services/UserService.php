<?php

namespace App\Services;

use App\Actions\User\AttachUserToTenantAction;
use App\Actions\User\CreateUserAction;
use App\Actions\User\DeleteUserAction;
use App\Actions\User\UpdateUserAction;
use App\DTO\User\UserData;
use App\Exceptions\BusinessException;
use App\Exceptions\NotFoundException;
use App\Exceptions\UnauthorizedException;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class UserService
{
    public function __construct(
        private readonly CreateUserAction $createUserAction,
        private readonly UpdateUserAction $updateUserAction,
        private readonly DeleteUserAction $deleteUserAction,
        private readonly AttachUserToTenantAction $attachUserToTenantAction,
    ) {}

    public function getAll(User $currentUser, ?string $tenantUuid = null): Collection
    {
        if ($currentUser->isSuperAdmin()) {
            $query = User::with('tenants')->withCount('news');

            if ($tenantUuid) {
                $tenant = Tenant::where('uuid', $tenantUuid)->first();
                if ($tenant) {
                    $query->whereHas('tenants', function ($q) use ($tenant) {
                        $q->where('tenant_id', $tenant->id);
                    });
                }
            }

            return $query->get();
        }

        $tenantIds = $currentUser->tenants()->pluck('tenants.id')->toArray();

        return User::with('tenants')
            ->withCount('news')
            ->whereHas('tenants', function ($q) use ($tenantIds) {
                $q->whereIn('tenant_id', $tenantIds);
            })
            ->get();
    }

    public function getByUuid(string $uuid, User $currentUser): User
    {
        $user = User::with('tenants')->withCount('news')->where('uuid', $uuid)->first();

        if (! $user) {
            throw new NotFoundException('User not found');
        }

        if (! $currentUser->isSuperAdmin()) {
            $currentUserTenantIds = $currentUser->tenants()->pluck('tenants.id')->toArray();
            $userTenantIds = $user->tenants()->pluck('tenants.id')->toArray();

            $hasCommonTenant = ! empty(array_intersect($currentUserTenantIds, $userTenantIds));

            if (! $hasCommonTenant && $currentUser->id !== $user->id) {
                throw new UnauthorizedException('You do not have permission to view this user.');
            }
        }

        return $user;
    }

    public function findByUuid(string $uuid): ?User
    {
        return User::where('uuid', $uuid)->first();
    }

    public function create(array $data, User $currentUser): User
    {
        if (! $currentUser->isSuperAdmin()) {
            throw new UnauthorizedException('Only Super Admin can create users.');
        }

        $userData = UserData::fromArray($data);
        $user = $this->createUserAction->execute($userData);

        if (isset($data['tenant_uuid'])) {
            $tenant = Tenant::where('uuid', $data['tenant_uuid'])->first();
            if ($tenant) {
                $this->attachUserToTenantAction->execute($user, $tenant->id, $data['role'] ?? 'editor');
            }
        } elseif (isset($data['tenant_id'])) {
            $this->attachUserToTenantAction->execute($user, $data['tenant_id'], $data['role'] ?? 'editor');
        }

        return $user->fresh()->load('tenants');
    }

    public function update(User $user, array $data, User $currentUser): User
    {
        if (! $currentUser->isSuperAdmin()) {
            throw new UnauthorizedException('Only Super Admin can update users.');
        }

        // Verificar se está tentando mudar o tenant e se o usuário tem news
        $isTenantChange = false;
        $newTenantId = null;

        if (isset($data['tenant_uuid']) && ! empty($data['tenant_uuid'])) {
            $tenant = Tenant::where('uuid', $data['tenant_uuid'])->first();
            if ($tenant) {
                $currentTenantIds = $user->tenants()->pluck('tenants.id')->toArray();
                $isTenantChange = ! in_array($tenant->id, $currentTenantIds);
                $newTenantId = $tenant->id;
            }
        } elseif (isset($data['tenant_id']) && ! empty($data['tenant_id'])) {
            $currentTenantIds = $user->tenants()->pluck('tenants.id')->toArray();
            $isTenantChange = ! in_array($data['tenant_id'], $currentTenantIds);
            $newTenantId = $data['tenant_id'];
        }

        // Se está mudando tenant, verificar se tem news
        if ($isTenantChange) {
            $newsCount = $user->news()->count();
            if ($newsCount > 0) {
                throw new BusinessException(
                    "Cannot change user tenant. This user has {$newsCount} news article(s) associated with the current tenant. Please reassign or delete the news first."
                );
            }
        }

        $this->updateUserAction->execute($user, $data);

        if ($newTenantId) {
            $user->tenants()->sync([
                $newTenantId => ['role' => $data['role'] ?? 'editor'],
            ]);
        }

        return $user->fresh()->load('tenants');
    }

    public function delete(User $user, User $currentUser): bool
    {
        if (! $currentUser->isSuperAdmin()) {
            throw new UnauthorizedException('Only Super Admin can delete users.');
        }

        // Verificar se o usuário tem news associadas
        $newsCount = $user->news()->count();
        if ($newsCount > 0) {
            throw new BusinessException(
                "Cannot delete user. This user has {$newsCount} news article(s) associated. Please reassign or delete the news first."
            );
        }

        return $this->deleteUserAction->execute($user);
    }
}
