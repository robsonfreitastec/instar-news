<?php

return [

    'paths' => ['api/*', 'sanctum/csrf-cookie', 'api/documentation', 'docs/*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => ['*'],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [
        'Authorization',
        'X-Tenant-ID',
        'Content-Type',
        'Accept',
    ],

    'max_age' => 86400,

    'supports_credentials' => true,

];
