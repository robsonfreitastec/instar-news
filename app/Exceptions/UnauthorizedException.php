<?php

namespace App\Exceptions;

use Exception;

class UnauthorizedException extends Exception
{
    protected $message = 'Unauthorized';

    protected $code = 403;

    public function __construct(?string $message = null)
    {
        parent::__construct($message ?? $this->message, $this->code);
    }
}

