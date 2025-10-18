<?php

use App\Http\Controllers\Api\ActivityLogController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\NewsController;
use App\Http\Controllers\Api\TenantController;
use App\Http\Controllers\Api\TenantUserController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

// Authentication routes (sem middleware)
Route::post('/login', [AuthController::class, 'login']);

// Rotas protegidas
Route::middleware(['auth:api'])->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/refresh', [AuthController::class, 'refresh']);
    Route::get('/me', [AuthController::class, 'me']);

    // News
    Route::get('/news', [NewsController::class, 'index']);
    Route::post('/news', [NewsController::class, 'store']);
    Route::get('/news/{uuid}', [NewsController::class, 'show']);
    Route::put('/news/{uuid}', [NewsController::class, 'update']);
    Route::delete('/news/{uuid}', [NewsController::class, 'destroy']);

    // Tenants
    Route::get('/tenants', [TenantController::class, 'index']);
    Route::post('/tenants', [TenantController::class, 'store']);
    Route::get('/tenants/{uuid}', [TenantController::class, 'show']);
    Route::put('/tenants/{uuid}', [TenantController::class, 'update']);
    Route::delete('/tenants/{uuid}', [TenantController::class, 'destroy']);

    // Tenant-User management
    Route::post('/tenants/{uuid}/users', [TenantUserController::class, 'attach']);
    Route::delete('/tenants/{uuid}/users/{user_uuid}', [TenantUserController::class, 'detach']);

    // Users
    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::get('/users/{uuid}', [UserController::class, 'show']);
    Route::put('/users/{uuid}', [UserController::class, 'update']);
    Route::delete('/users/{uuid}', [UserController::class, 'destroy']);

    // Activity Logs
    Route::get('/logs', [ActivityLogController::class, 'index']);
    Route::get('/logs/{uuid}', [ActivityLogController::class, 'show']);
});
