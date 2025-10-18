<?php

namespace App\DTO\User;

class UserData
{
    public function __construct(
        public readonly string $name,
        public readonly string $email,
        public readonly string $password,
        public readonly bool $isSuperAdmin = false,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            name: $data['name'],
            email: $data['email'],
            password: $data['password'],
            isSuperAdmin: $data['is_super_admin'] ?? false,
        );
    }

    public function toArray(): array
    {
        return [
            'name' => $this->name,
            'email' => $this->email,
            'password' => $this->password,
            'is_super_admin' => $this->isSuperAdmin,
        ];
    }
}
