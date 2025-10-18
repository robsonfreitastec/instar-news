<?php

namespace App\Actions\News;

use App\Models\News;

class DeleteNewsAction
{
    public function execute(News $news): bool
    {
        return $news->delete();
    }
}
