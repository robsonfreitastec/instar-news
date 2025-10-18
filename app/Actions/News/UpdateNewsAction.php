<?php

namespace App\Actions\News;

use App\Models\News;

class UpdateNewsAction
{
    public function execute(News $news, array $data): News
    {
        $news->update($data);

        return $news->fresh();
    }
}
