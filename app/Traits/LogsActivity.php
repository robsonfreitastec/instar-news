<?php

namespace App\Traits;

use App\Models\ActivityLog;
use Illuminate\Database\Eloquent\Model;

trait LogsActivity
{
    /**
     * Boot the trait.
     */
    protected static function bootLogsActivity(): void
    {
        static::created(function (Model $model) {
            $model->logActivity('created', null, $model->getAttributes());
        });

        static::updated(function (Model $model) {
            $model->logActivity('updated', $model->getOriginal(), $model->getAttributes());
        });

        static::deleted(function (Model $model) {
            $model->logActivity('deleted', $model->getAttributes(), null);
        });
    }

    /**
     * Log an activity.
     */
    protected function logActivity(string $type, ?array $oldValues, ?array $newValues): void
    {
        $user = auth()->user();

        // Get tenant_id from model or request
        $tenantId = $this->tenant_id ?? request()->input('tenant_id') ?? null;

        ActivityLog::create([
            'log_type' => $type,
            'model_type' => get_class($this),
            'model_uuid' => $this->uuid,
            'user_id' => $user?->id,
            'tenant_id' => $tenantId,
            'old_values' => $this->filterSensitiveData($oldValues),
            'new_values' => $this->filterSensitiveData($newValues),
            'description' => $this->getActivityDescription($type),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }

    /**
     * Filter sensitive data from logs.
     */
    protected function filterSensitiveData(?array $data): ?array
    {
        if (! $data) {
            return null;
        }

        // Remove IDs internos e dados sensíveis
        $sensitiveFields = ['id', 'password', 'remember_token', 'tenant_id', 'author_id', 'user_id'];

        return array_diff_key($data, array_flip($sensitiveFields));
    }

    /**
     * Get activity description.
     */
    protected function getActivityDescription(string $type): string
    {
        $modelName = class_basename($this);
        $modelTitle = $this->title ?? $this->name ?? $this->uuid;

        return match ($type) {
            'created' => "{$modelName} '{$modelTitle}' foi criado",
            'updated' => "{$modelName} '{$modelTitle}' foi atualizado",
            'deleted' => "{$modelName} '{$modelTitle}' foi excluído",
            default => "{$modelName} '{$modelTitle}' - {$type}",
        };
    }
}
