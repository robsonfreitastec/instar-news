<?php

use App\Models\News;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->tenant = Tenant::factory()->create();

    $this->superAdmin = User::factory()->create(['is_super_admin' => true]);

    $this->admin = User::factory()->create();
    $this->admin->tenants()->attach($this->tenant->id, ['role' => 'admin']);

    $this->editor = User::factory()->create();
    $this->editor->tenants()->attach($this->tenant->id, ['role' => 'editor']);

    $this->news = News::factory()->create([
        'tenant_id' => $this->tenant->id,
        'author_id' => $this->admin->id,
    ]);
});

test('super admin can list all news', function () {
    $token = auth()->login($this->superAdmin);

    $response = $this->withHeader('Authorization', "Bearer {$token}")
        ->getJson('/api/news');

    $response->assertStatus(200)
        ->assertJsonStructure([
            'success',
            'data',
            'meta',
        ]);
});

test('user can create news in their tenant', function () {
    $token = auth()->login($this->admin);

    $response = $this->withHeader('Authorization', "Bearer {$token}")
        ->withHeader('X-Tenant-ID', $this->tenant->id)
        ->postJson('/api/news', [
            'title' => 'Test News',
            'content' => 'Test content',
        ]);

    $response->assertStatus(201);
    $this->assertDatabaseHas('news', [
        'title' => 'Test News',
        'tenant_id' => $this->tenant->id,
    ]);
});

test('admin can delete news from their tenant', function () {
    $token = auth()->login($this->admin);

    $response = $this->withHeader('Authorization', "Bearer {$token}")
        ->deleteJson("/api/news/{$this->news->uuid}");

    $response->assertStatus(200);
    $this->assertSoftDeleted('news', ['uuid' => $this->news->uuid]);
});

test('editor cannot delete news', function () {
    $token = auth()->login($this->editor);

    $response = $this->withHeader('Authorization', "Bearer {$token}")
        ->deleteJson("/api/news/{$this->news->uuid}");

    $response->assertStatus(403);
});

test('editor can edit news from their tenant', function () {
    $token = auth()->login($this->editor);

    $response = $this->withHeader('Authorization', "Bearer {$token}")
        ->putJson("/api/news/{$this->news->uuid}", [
            'title' => 'Updated Title',
        ]);

    $response->assertStatus(200);
    $this->assertDatabaseHas('news', [
        'uuid' => $this->news->uuid,
        'title' => 'Updated Title',
    ]);
});
