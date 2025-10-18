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
}
