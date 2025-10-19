<?php

namespace App\Services;

use App\Actions\News\CreateNewsAction;
use App\Actions\News\DeleteNewsAction;
use App\Actions\News\UpdateNewsAction;
use App\DTO\News\NewsData;
use App\Models\News;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;

class NewsService
{
    public function __construct(
        private readonly CreateNewsAction $createNewsAction,
        private readonly UpdateNewsAction $updateNewsAction,
        private readonly DeleteNewsAction $deleteNewsAction,
    ) {}

    public function getAll(
        User $currentUser,
        ?string $tenantUuid = null,
        ?string $authorUuid = null,
        ?string $search = null,
        ?string $status = null,
        int $perPage = 15
    ): LengthAwarePaginator {
        $query = News::with(['author', 'tenant']);

        if ($currentUser->isSuperAdmin()) {
            if ($tenantUuid) {
                $tenant = \App\Models\Tenant::where('uuid', $tenantUuid)->first();
                if ($tenant) {
                    $query->forTenant($tenant->id);
                }
            }
        } else {
            $tenantIds = $currentUser->tenants()->pluck('tenants.id')->toArray();
            if (empty($tenantIds)) {
                return new LengthAwarePaginator([], 0, $perPage);
            }
            $query->whereIn('tenant_id', $tenantIds);
        }

        if ($authorUuid) {
            $author = \App\Models\User::where('uuid', $authorUuid)->first();
            if ($author) {
                $query->where('author_id', $author->id);
            }
        }

        if ($status && in_array($status, News::getAvailableStatuses())) {
            $query->withStatus($status);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'ILIKE', "%{$search}%")
                    ->orWhere('content', 'ILIKE', "%{$search}%");
            });
        }

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    public function getByUuid(string $uuid, User $currentUser): News
    {
        $news = News::with(['author', 'tenant'])->where('uuid', $uuid)->first();

        if (! $news) {
            throw new \App\Exceptions\NotFoundException('News not found');
        }

        if (! $currentUser->isSuperAdmin()) {
            $userTenantIds = $currentUser->tenants()->pluck('tenants.id')->toArray();
            if (! in_array($news->tenant_id, $userTenantIds)) {
                throw new \App\Exceptions\UnauthorizedException('You do not have permission to view this news.');
            }
        }

        return $news;
    }

    public function findByUuid(string $uuid): ?News
    {
        return News::where('uuid', $uuid)->first();
    }

    public function create(array $data, User $currentUser, ?string $tenantUuid = null): News
    {
        $tenantId = $this->resolveTenantId($currentUser, $tenantUuid);

        $newsData = NewsData::fromArray([
            'title' => $data['title'],
            'content' => $data['content'],
            'status' => $data['status'] ?? News::STATUS_DRAFT,
            'tenant_id' => $tenantId,
            'author_id' => $currentUser->id,
        ]);

        return $this->createNewsAction->execute($newsData);
    }

    private function resolveTenantId(User $currentUser, ?string $tenantUuid): int
    {
        if ($currentUser->isSuperAdmin()) {
            if (! $tenantUuid) {
                throw new \App\Exceptions\BusinessException('Super Admin must specify tenant_uuid when creating news.');
            }

            $tenant = \App\Models\Tenant::where('uuid', $tenantUuid)->first();
            if (! $tenant) {
                throw new \App\Exceptions\NotFoundException('Tenant not found');
            }

            return $tenant->id;
        }

        if ($tenantUuid) {
            $tenant = \App\Models\Tenant::where('uuid', $tenantUuid)->first();

            if (! $tenant) {
                throw new \App\Exceptions\NotFoundException('Tenant not found');
            }

            if (! $currentUser->belongsToTenant($tenant->id)) {
                throw new \App\Exceptions\UnauthorizedException('You do not have permission to create news in this tenant.');
            }

            return $tenant->id;
        }

        $tenantId = $currentUser->tenants()->first()?->id;

        if (! $tenantId) {
            throw new \App\Exceptions\BusinessException('User must be associated with at least one tenant.');
        }

        return $tenantId;
    }

    public function update(News $news, array $data, User $currentUser): News
    {
        if (! $currentUser->isSuperAdmin()) {
            $userTenantIds = $currentUser->tenants()->pluck('tenants.id')->toArray();
            if (! in_array($news->tenant_id, $userTenantIds)) {
                throw new \App\Exceptions\UnauthorizedException('You do not have permission to update this news.');
            }
        }

        return $this->updateNewsAction->execute($news, $data);
    }

    public function delete(News $news, User $currentUser): bool
    {
        if (! $currentUser->isSuperAdmin()) {
            $userTenantIds = $currentUser->tenants()->pluck('tenants.id')->toArray();
            if (! in_array($news->tenant_id, $userTenantIds)) {
                throw new \App\Exceptions\UnauthorizedException('You do not have permission to delete this news.');
            }

            $isAuthor = $news->author_id === $currentUser->id;
            $isAdminOfTenant = $currentUser->tenants()
                ->where('tenant_id', $news->tenant_id)
                ->wherePivot('role', 'admin')
                ->exists();

            if (! $isAuthor && ! $isAdminOfTenant) {
                throw new \App\Exceptions\UnauthorizedException('Only the author or tenant admin can delete this news.');
            }
        }

        return $this->deleteNewsAction->execute($news);
    }
}
