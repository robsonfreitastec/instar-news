<?php

namespace App\Models;

use App\Traits\UsesUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActivityLog extends Model
{
    use HasFactory, UsesUuid;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'log_type',
        'model_type',
        'model_uuid',
        'user_id',
        'tenant_id',
        'old_values',
        'new_values',
        'description',
        'ip_address',
        'user_agent',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'id',
        'user_id',
        'tenant_id',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'old_values' => 'array',
            'new_values' => 'array',
        ];
    }

    /**
     * Convert the model instance to an array.
     */
    public function toArray(): array
    {
        $array = parent::toArray();

        // Filtrar IDs sensíveis de old_values e new_values
        if (isset($array['old_values'])) {
            $array['old_values'] = $this->filterSensitiveIds($array['old_values']);
        }

        if (isset($array['new_values'])) {
            $array['new_values'] = $this->filterSensitiveIds($array['new_values']);
        }

        return $array;
    }

    /**
     * Filter sensitive IDs from data.
     */
    private function filterSensitiveIds(?array $data): ?array
    {
        if (! $data) {
            return null;
        }

        $sensitiveFields = ['id', 'tenant_id', 'author_id', 'user_id'];

        return array_diff_key($data, array_flip($sensitiveFields));
    }

    /**
     * Get the user that performed the action.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the tenant associated with the log.
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Get formatted changes.
     */
    public function getChangesAttribute(): array
    {
        $changes = [];

        if ($this->log_type === 'updated' && $this->old_values && $this->new_values) {
            foreach ($this->new_values as $key => $newValue) {
                $oldValue = $this->old_values[$key] ?? null;
                if ($oldValue !== $newValue) {
                    $changes[$key] = [
                        'old' => $oldValue,
                        'new' => $newValue,
                    ];
                }
            }
        }

        return $changes;
    }
}
