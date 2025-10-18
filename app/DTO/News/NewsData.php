<?php

namespace App\DTO\News;

class NewsData
{
    public function __construct(
        public readonly string $title,
        public readonly string $content,
        public readonly ?int $tenantId,
        public readonly int $authorId,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            title: $data['title'],
            content: $data['content'],
            tenantId: $data['tenant_id'],
            authorId: $data['author_id'],
        );
    }

    public function toArray(): array
    {
        return [
            'title' => $this->title,
            'content' => $this->content,
            'tenant_id' => $this->tenantId,
            'author_id' => $this->authorId,
        ];
    }
}
