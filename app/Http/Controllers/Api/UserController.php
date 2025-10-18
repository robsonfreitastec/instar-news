<?php

namespace App\Http\Controllers\Api;

use App\Exceptions\BusinessException;
use App\Exceptions\NotFoundException;
use App\Exceptions\UnauthorizedException;
use App\Helpers\ResponseFormatter;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\CreateUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @OA\Tag(
 *     name="Users",
 *     description="API Endpoints for user management"
 * )
 */
class UserController extends Controller
{
    public function __construct(
        private readonly UserService $userService
    ) {}

    /**
     * @OA\Get(
     *     path="/api/users",
     *     tags={"Users"},
     *     summary="Get all users for tenant",
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Response(response=200, description="Users retrieved successfully")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $users = $this->userService->getAll(
            auth()->user(),
            $request->input('tenant_uuid')
        );

        return ResponseFormatter::success($users, 'Users retrieved successfully');
    }

    /**
     * @OA\Post(
     *     path="/api/users",
     *     tags={"Users"},
     *     summary="Create user (Super Admin only)",
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\RequestBody(
     *         required=true,
     *
     *         @OA\JsonContent(
     *             required={"name","email","password"},
     *
     *             @OA\Property(property="name", type="string", example="João Silva"),
     *             @OA\Property(property="email", type="string", example="joao.silva@example.com"),
     *             @OA\Property(property="password", type="string", example="password123"),
     *             @OA\Property(property="is_super_admin", type="boolean", example=false),
     *             @OA\Property(property="tenant_uuid", type="string", format="uuid", description="Tenant UUID"),
     *             @OA\Property(property="role", type="string", example="editor", enum={"admin", "editor"})
     *         )
     *     ),
     *
     *     @OA\Response(response=201, description="User created successfully"),
     *     @OA\Response(response=403, description="Unauthorized - Super Admin only")
     * )
     */
    public function store(CreateUserRequest $request): JsonResponse
    {
        try {
            $user = $this->userService->create($request->validated(), auth()->user());

            return ResponseFormatter::success($user, 'User created successfully', 201);
        } catch (UnauthorizedException $e) {
            return ResponseFormatter::error($e->getMessage(), null, 403);
        }
    }

    /**
     * @OA\Get(
     *     path="/api/users/{uuid}",
     *     tags={"Users"},
     *     summary="Get a single user",
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Parameter(
     *         name="uuid",
     *         in="path",
     *         required=true,
     *
     *         @OA\Schema(type="string")
     *     ),
     *
     *     @OA\Response(response=200, description="User retrieved successfully")
     * )
     */
    public function show(string $uuid): JsonResponse
    {
        try {
            $user = $this->userService->getByUuid($uuid, auth()->user());

            return ResponseFormatter::success($user, 'User retrieved successfully');
        } catch (NotFoundException $e) {
            return ResponseFormatter::error($e->getMessage(), null, 404);
        } catch (UnauthorizedException $e) {
            return ResponseFormatter::error($e->getMessage(), null, 403);
        }
    }

    /**
     * @OA\Put(
     *     path="/api/users/{uuid}",
     *     tags={"Users"},
     *     summary="Update user (Super Admin only)",
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Parameter(
     *         name="uuid",
     *         in="path",
     *         required=true,
     *
     *         @OA\Schema(type="string")
     *     ),
     *
     *     @OA\RequestBody(
     *         required=true,
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="name", type="string", example="João Silva Atualizado"),
     *             @OA\Property(property="email", type="string", example="updated@example.com"),
     *             @OA\Property(property="password", type="string", example="newpassword123"),
     *             @OA\Property(property="is_super_admin", type="boolean", example=false),
     *             @OA\Property(property="tenant_uuid", type="string", format="uuid", description="Tenant UUID"),
     *             @OA\Property(property="role", type="string", example="admin", enum={"admin", "editor"})
     *         )
     *     ),
     *
     *     @OA\Response(response=200, description="User updated successfully"),
     *     @OA\Response(response=403, description="Unauthorized - Super Admin only")
     * )
     */
    public function update(UpdateUserRequest $request, string $uuid): JsonResponse
    {
        try {
            $user = $this->userService->findByUuid($uuid);

            if (! $user) {
                throw new NotFoundException('User not found');
            }

            $updatedUser = $this->userService->update($user, $request->validated(), auth()->user());

            return ResponseFormatter::success($updatedUser, 'User updated successfully');
        } catch (NotFoundException $e) {
            return ResponseFormatter::error($e->getMessage(), null, 404);
        } catch (UnauthorizedException $e) {
            return ResponseFormatter::error($e->getMessage(), null, 403);
        }
    }

    /**
     * @OA\Delete(
     *     path="/api/users/{uuid}",
     *     tags={"Users"},
     *     summary="Delete user (Super Admin only)",
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Parameter(
     *         name="uuid",
     *         in="path",
     *         required=true,
     *
     *         @OA\Schema(type="string")
     *     ),
     *
     *     @OA\Response(response=200, description="User deleted successfully"),
     *     @OA\Response(response=403, description="Unauthorized - Super Admin only")
     * )
     */
    public function destroy(string $uuid): JsonResponse
    {
        try {
            $user = $this->userService->findByUuid($uuid);

            if (! $user) {
                throw new NotFoundException('User not found');
            }

            $this->userService->delete($user, auth()->user());

            return ResponseFormatter::success(null, 'User deleted successfully');
        } catch (NotFoundException $e) {
            return ResponseFormatter::error($e->getMessage(), null, 404);
        } catch (UnauthorizedException $e) {
            return ResponseFormatter::error($e->getMessage(), null, 403);
        } catch (BusinessException $e) {
            return ResponseFormatter::error($e->getMessage(), null, 400);
        }
    }
}
