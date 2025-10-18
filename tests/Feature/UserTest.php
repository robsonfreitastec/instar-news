<?php

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->superAdmin = User::factory()->create(['is_super_admin' => true]);
    $this->regularUser = User::factory()->create();
    $this->tenant = Tenant::factory()->create();
});

test('super admin can create user', function () {
    $token = auth()->login($this->superAdmin);

    $response = $this->withHeader('Authorization', "Bearer {$token}")
        ->withHeader('X-Tenant-ID', $this->tenant->id)
        ->postJson('/api/users', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password123',
            'tenant_id' => $this->tenant->id,
            'role' => 'editor',
        ]);

    $response->assertStatus(201);
    $this->assertDatabaseHas('users', [
        'email' => 'test@example.com',
    ]);
});

test('regular user cannot create user', function () {
    $token = auth()->login($this->regularUser);

    $response = $this->withHeader('Authorization', "Bearer {$token}")
        ->withHeader('X-Tenant-ID', $this->tenant->id)
        ->postJson('/api/users', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

    $response->assertStatus(403);
});

test('super admin can update user', function () {
    $user = User::factory()->create(['name' => 'Old Name']);
    $token = auth()->login($this->superAdmin);

    $response = $this->withHeader('Authorization', "Bearer {$token}")
        ->withHeader('X-Tenant-ID', $this->tenant->id)
        ->putJson("/api/users/{$user->uuid}", [
            'name' => 'New Name',
        ]);

    $response->assertStatus(200);
    $this->assertDatabaseHas('users', [
        'uuid' => $user->uuid,
        'name' => 'New Name',
    ]);
});

test('super admin can delete user', function () {
    $user = User::factory()->create();
    $token = auth()->login($this->superAdmin);

    $response = $this->withHeader('Authorization', "Bearer {$token}")
        ->withHeader('X-Tenant-ID', $this->tenant->id)
        ->deleteJson("/api/users/{$user->uuid}");

    $response->assertStatus(200);
    $this->assertSoftDeleted('users', ['uuid' => $user->uuid]);
});
