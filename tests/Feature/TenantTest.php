<?php

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->superAdmin = User::factory()->create(['is_super_admin' => true]);
    $this->regularUser = User::factory()->create();
});

test('super admin can list tenants', function () {
    Tenant::factory()->count(3)->create();
    $token = auth()->login($this->superAdmin);

    $response = $this->withHeader('Authorization', "Bearer {$token}")
        ->getJson('/api/tenants');

    $response->assertStatus(200)
        ->assertJsonCount(3, 'data');
});

test('regular user cannot list tenants', function () {
    $token = auth()->login($this->regularUser);

    $response = $this->withHeader('Authorization', "Bearer {$token}")
        ->getJson('/api/tenants');

    $response->assertStatus(403);
});

test('super admin can create tenant', function () {
    $token = auth()->login($this->superAdmin);

    $response = $this->withHeader('Authorization', "Bearer {$token}")
        ->postJson('/api/tenants', [
            'name' => 'New Tenant',
            'domain' => 'newtenant.com',
        ]);

    $response->assertStatus(201);
    $this->assertDatabaseHas('tenants', [
        'name' => 'New Tenant',
    ]);
});

test('cannot delete tenant with users', function () {
    $tenant = Tenant::factory()->create();
    $user = User::factory()->create();
    $user->tenants()->attach($tenant->id, ['role' => 'editor']);

    $token = auth()->login($this->superAdmin);

    $response = $this->withHeader('Authorization', "Bearer {$token}")
        ->deleteJson("/api/tenants/{$tenant->uuid}");

    $response->assertStatus(400);
});
