<?php

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->tenant = Tenant::factory()->create(['name' => 'Test Tenant']);

    $this->superAdmin = User::factory()->create([
        'email' => 'superadmin@test.com',
        'password' => bcrypt('password'),
        'is_super_admin' => true,
    ]);

    $this->admin = User::factory()->create([
        'email' => 'admin@test.com',
        'password' => bcrypt('password'),
    ]);
    $this->admin->tenants()->attach($this->tenant->id, ['role' => 'admin']);

    $this->editor = User::factory()->create([
        'email' => 'editor@test.com',
        'password' => bcrypt('password'),
    ]);
    $this->editor->tenants()->attach($this->tenant->id, ['role' => 'editor']);
});

test('user can login with valid credentials', function () {
    $response = $this->postJson('/api/login', [
        'email' => 'superadmin@test.com',
        'password' => 'password',
    ]);

    $response->assertStatus(200)
        ->assertJsonStructure([
            'success',
            'message',
            'data' => [
                'access_token',
                'token_type',
                'expires_in',
                'user',
            ],
        ]);
});

test('user cannot login with invalid credentials', function () {
    $response = $this->postJson('/api/login', [
        'email' => 'superadmin@test.com',
        'password' => 'wrong-password',
    ]);

    $response->assertStatus(401);
});

test('authenticated user can get their data', function () {
    $token = auth()->login($this->superAdmin);

    $response = $this->withHeader('Authorization', "Bearer {$token}")
        ->getJson('/api/me');

    $response->assertStatus(200)
        ->assertJson([
            'success' => true,
            'data' => [
                'email' => 'superadmin@test.com',
            ],
        ]);
});

test('user can logout', function () {
    $token = auth()->login($this->superAdmin);

    $response = $this->withHeader('Authorization', "Bearer {$token}")
        ->postJson('/api/logout');

    $response->assertStatus(200);
});
