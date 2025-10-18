<?php

namespace App\Http\Controllers\Api;

use App\Exceptions\NotFoundException;
use App\Exceptions\UnauthorizedException;
use App\Helpers\ResponseFormatter;
use App\Http\Controllers\Controller;
use App\Http\Requests\TenantUser\AttachUserRequest;
use App\Models\Tenant;
use App\Models\User;
use App\Services\TenantService;
use Illuminate\Http\JsonResponse;

/**
 * @OA\Tag(
 *     name="Tenant Users",
 *     description="API Endpoints for tenant-user management (Super Admin only)"
 * )
 */
class TenantUserController extends Controller
{
    public function __construct(
        private readonly TenantService $tenantService
    ) {}

    /**
     * @OA\Post(
     *     path="/api/tenants/{uuid}/users",
     *     tags={"Tenant Users"},
     *     summary="Add user to tenant (Super Admin only)",
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
     *             required={"user_uuid","role"},
     *
     *             @OA\Property(property="user_uuid", type="string", format="uuid", description="User UUID"),
     *             @OA\Property(property="role", type="string", example="editor", enum={"admin", "editor"})
     *         )
     *     ),
     *
     *     @OA\Response(response=200, description="User added to tenant successfully"),
     *     @OA\Response(response=401, description="Unauthenticated"),
     *     @OA\Response(response=403, description="Unauthorized - Super Admin only"),
     *     @OA\Response(response=404, description="Tenant or User not found"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function attach(AttachUserRequest $request, string $uuid): JsonResponse
    {
        try {
            $updatedTenant = $this->tenantService->attachUserByUuids(
                $uuid,
                $request->input('user_uuid'),
                $request->input('role'),
                auth()->user()
            );

            return ResponseFormatter::success($updatedTenant, 'User added to tenant successfully');
        } catch (NotFoundException $e) {
            return ResponseFormatter::error($e->getMessage(), null, 404);
        } catch (UnauthorizedException $e) {
            return ResponseFormatter::error($e->getMessage(), null, 403);
        }
    }

    /**
     * @OA\Delete(
     *     path="/api/tenants/{uuid}/users/{user_uuid}",
     *     tags={"Tenant Users"},
     *     summary="Remove user from tenant (Super Admin only)",
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Parameter(
     *         name="uuid",
     *         in="path",
     *         required=true,
     *         description="Tenant UUID",
     *
     *         @OA\Schema(type="string", format="uuid")
     *     ),
     *
     *     @OA\Parameter(
     *         name="user_uuid",
     *         in="path",
     *         required=true,
     *         description="User UUID",
     *
     *         @OA\Schema(type="string", format="uuid")
     *     ),
     *
     *     @OA\Response(response=200, description="User removed from tenant successfully"),
     *     @OA\Response(response=401, description="Unauthenticated"),
     *     @OA\Response(response=403, description="Unauthorized - Super Admin only"),
     *     @OA\Response(response=404, description="Tenant or User not found")
     * )
     */
    public function detach(string $uuid, string $userUuid): JsonResponse
    {
        try {
            $updatedTenant = $this->tenantService->detachUserByUuids(
                $uuid,
                $userUuid,
                auth()->user()
            );

            return ResponseFormatter::success($updatedTenant, 'User removed from tenant successfully');
        } catch (NotFoundException $e) {
            return ResponseFormatter::error($e->getMessage(), null, 404);
        } catch (UnauthorizedException $e) {
            return ResponseFormatter::error($e->getMessage(), null, 403);
        }
    }
}
