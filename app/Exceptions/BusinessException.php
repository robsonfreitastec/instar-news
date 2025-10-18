<?php

namespace App\Exceptions;

use Exception;

class BusinessException extends Exception
{
    protected $code = 400;

    public function __construct(string $message, int $code = 400)
    {
        parent::__construct($message, $code);
    }
}

