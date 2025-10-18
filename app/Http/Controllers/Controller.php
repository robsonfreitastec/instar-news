<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

/**
 * @OA\Info(
 *     title="InstarNews API",
 *     version="1.0.0",
 *     description="Multi-tenant news management API with JWT authentication",
 *
 *     @OA\Contact(
 *         email="admin@instar.com.br"
 *     )
 * )
 *
 * @OA\Server(
 *     url="http://localhost:8000",
 *     description="Local development server"
 * )
 *
 * @OA\SecurityScheme(
 *     securityScheme="bearerAuth",
 *     type="http",
 *     scheme="bearer",
 *     bearerFormat="JWT",
 *     description="JWT Authorization header using the Bearer scheme"
 * )
 *
 * @OA\Tag(
 *     name="Authentication",
 *     description="Endpoints de autenticação"
 * )
 * @OA\Tag(
 *     name="News",
 *     description="Endpoints de gestão de notícias"
 * )
 * @OA\Tag(
 *     name="Users",
 *     description="Endpoints de gestão de usuários"
 * )
 * @OA\Tag(
 *     name="Tenants",
 *     description="Endpoints de gestão de tenants"
 * )
 * @OA\Tag(
 *     name="Activity Logs",
 *     description="Endpoints de logs de atividade"
 * )
 */
abstract class Controller
{
    use AuthorizesRequests;
}
