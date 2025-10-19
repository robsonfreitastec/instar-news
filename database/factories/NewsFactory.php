<?php

namespace Database\Factories;

use App\Models\News;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\News>
 */
class NewsFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => fake()->sentence(),
            'content' => fake()->paragraphs(5, true),
            'status' => fake()->randomElement(News::getAvailableStatuses()),
            'tenant_id' => Tenant::factory(),
            'author_id' => User::factory(),
        ];
    }

    /**
     * Set the tenant for the news.
     */
    public function forTenant(int $tenantId): static
    {
        return $this->state(fn (array $attributes) => [
            'tenant_id' => $tenantId,
        ]);
    }

    /**
     * Set the author for the news.
     */
    public function byAuthor(int $authorId): static
    {
        return $this->state(fn (array $attributes) => [
            'author_id' => $authorId,
        ]);
    }

    /**
     * Create a draft news.
     */
    public function draft(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => News::STATUS_DRAFT,
        ]);
    }

    /**
     * Create a published news.
     */
    public function published(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => News::STATUS_PUBLISHED,
        ]);
    }

    /**
     * Create an archived news.
     */
    public function archived(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => News::STATUS_ARCHIVED,
        ]);
    }

    /**
     * Create a trashed news.
     */
    public function trashed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => News::STATUS_TRASH,
        ]);
    }
}
