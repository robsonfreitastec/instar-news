<?php

namespace App\DTO\Tenant;

class TenantData
{
    public function __construct(
        public readonly string $name,
        public readonly ?string $domain = null,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            name: $data['name'],
            domain: $data['domain'] ?? null,
        );
    }

    public function toArray(): array
    {
        return [
            'name' => $this->name,
            'domain' => $this->domain,
        ];
    }
}
