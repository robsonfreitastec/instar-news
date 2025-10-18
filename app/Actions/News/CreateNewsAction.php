<?php

namespace App\Actions\News;

use App\DTO\News\NewsData;
use App\Models\News;

class CreateNewsAction
{
    public function execute(NewsData $data): News
    {
        return News::create($data->toArray());
    }
}
