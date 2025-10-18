<?php

namespace App\Exceptions;

use Exception;

class ValidationException extends Exception
{
    protected $code = 422;

    public function __construct(string $message = 'Validation failed', protected mixed $errors = null)
    {
        parent::__construct($message, $this->code);
    }

    public function getErrors(): mixed
    {
        return $this->errors;
    }
}

