<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthService
{
    public function login(string $email, string $password): ?array
    {
        $credentials = ['email' => $email, 'password' => $password];

        if (! $token = JWTAuth::attempt($credentials)) {
            return null;
        }

        $user = auth()->user();
        $firstTenant = $user->tenants()->first();
        $tenantId = $firstTenant?->id;
        $role = $firstTenant?->pivot?->role;

        return [
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => JWTAuth::factory()->getTTL() * 60,
            'user' => $user,
            'tenant_id' => $tenantId,
            'role' => $role,
        ];
    }

    public function register(array $data): User
    {
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'is_super_admin' => $data['is_super_admin'] ?? false,
        ]);

        if (isset($data['tenant_id'])) {
            $user->tenants()->attach($data['tenant_id'], [
                'role' => $data['role'] ?? 'editor',
            ]);
        }

        return $user;
    }

    public function logout(): void
    {
        JWTAuth::invalidate(JWTAuth::getToken());
    }

    public function refresh(): string
    {
        return JWTAuth::refresh(JWTAuth::getToken());
    }
}
