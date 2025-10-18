<?php

namespace App\Http\Controllers\Api;

use App\Exceptions\BusinessException;
use App\Exceptions\NotFoundException;
use App\Exceptions\UnauthorizedException;
use App\Helpers\ResponseFormatter;
use App\Http\Controllers\Controller;
use App\Http\Requests\Tenant\CreateTenantRequest;
use App\Http\Requests\Tenant\UpdateTenantRequest;
use App\Models\Tenant;
use App\Services\TenantService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @OA\Tag(
 *     name="Tenants",
 *     description="API Endpoints for tenant management"
 * )
 */
class TenantController extends Controller
{
    public function __construct(
        private readonly TenantService $tenantService
    ) {}

    /**
     * @OA\Get(
     *     path="/api/tenants",
     *     tags={"Tenants"},
     *     summary="Get all tenants (Super Admin only)",
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Response(response=200, description="Tenants retrieved successfully"),
     *     @OA\Response(response=401, description="Unauthenticated"),
     *     @OA\Response(response=403, description="Unauthorized - Super Admin only")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $tenants = $this->tenantService->getAll(
                auth()->user(),
                $request->input('search'),
                $request->input('per_page', 15)
            );

            return ResponseFormatter::paginated($tenants, 'Tenants retrieved successfully');
        } catch (UnauthorizedException $e) {
            return ResponseFormatter::error($e->getMessage(), null, 403);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/tenants",
     *     tags={"Tenants"},
     *     summary="Create tenant (Super Admin only)",
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\RequestBody(
     *         required=true,
     *
     *         @OA\JsonContent(
     *             required={"name"},
     *
     *             @OA\Property(property="name", type="string", example="Tenant A"),
     *             @OA\Property(property="domain", type="string", example="tenanta.com")
     *         )
     *     ),
     *
     *     @OA\Response(response=201, description="Tenant created successfully"),
     *     @OA\Response(response=401, description="Unauthenticated"),
     *     @OA\Response(response=403, description="Unauthorized - Super Admin only"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function store(CreateTenantRequest $request): JsonResponse
    {
        try {
            $tenant = $this->tenantService->create($request->validated(), auth()->user());

            return ResponseFormatter::success($tenant, 'Tenant created successfully', 201);
        } catch (UnauthorizedException $e) {
            return ResponseFormatter::error($e->getMessage(), null, 403);
        }
    }

    /**
     * @OA\Get(
     *     path="/api/tenants/{uuid}",
     *     tags={"Tenants"},
     *     summary="Get a single tenant",
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
     *     @OA\Response(response=200, description="Tenant retrieved successfully"),
     *     @OA\Response(response=401, description="Unauthenticated"),
     *     @OA\Response(response=403, description="Unauthorized"),
     *     @OA\Response(response=404, description="Tenant not found")
     * )
     */
    public function show(string $uuid): JsonResponse
    {
        try {
            $tenant = $this->tenantService->getByUuid($uuid, auth()->user());

            return ResponseFormatter::success($tenant, 'Tenant retrieved successfully');
        } catch (NotFoundException $e) {
            return ResponseFormatter::error($e->getMessage(), null, 404);
        } catch (UnauthorizedException $e) {
            return ResponseFormatter::error($e->getMessage(), null, 403);
        }
    }

    /**
     * @OA\Put(
     *     path="/api/tenants/{uuid}",
     *     tags={"Tenants"},
     *     summary="Update tenant (Super Admin only)",
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
     *             @OA\Property(property="name", type="string", example="Updated Tenant"),
     *             @OA\Property(property="domain", type="string", example="updated.com")
     *         )
     *     ),
     *
     *     @OA\Response(response=200, description="Tenant updated successfully"),
     *     @OA\Response(response=401, description="Unauthenticated"),
     *     @OA\Response(response=403, description="Unauthorized - Super Admin only"),
     *     @OA\Response(response=404, description="Tenant not found"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function update(UpdateTenantRequest $request, string $uuid): JsonResponse
    {
        try {
            $tenant = $this->tenantService->findByUuid($uuid);

            if (! $tenant) {
                throw new NotFoundException('Tenant not found');
            }

            $updatedTenant = $this->tenantService->update($tenant, $request->validated(), auth()->user());

            return ResponseFormatter::success($updatedTenant, 'Tenant updated successfully');
        } catch (NotFoundException $e) {
            return ResponseFormatter::error($e->getMessage(), null, 404);
        } catch (UnauthorizedException $e) {
            return ResponseFormatter::error($e->getMessage(), null, 403);
        }
    }

    /**
     * @OA\Delete(
     *     path="/api/tenants/{uuid}",
     *     tags={"Tenants"},
     *     summary="Delete tenant (Super Admin only)",
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
     *     @OA\Response(response=200, description="Tenant deleted successfully"),
     *     @OA\Response(response=401, description="Unauthenticated"),
     *     @OA\Response(response=403, description="Unauthorized - Super Admin only"),
     *     @OA\Response(response=404, description="Tenant not found")
     * )
     */
    public function destroy(string $uuid): JsonResponse
    {
        try {
            $tenant = $this->tenantService->findByUuid($uuid);

            if (! $tenant) {
                throw new NotFoundException('Tenant not found');
            }

            $this->tenantService->delete($tenant, auth()->user());

            return ResponseFormatter::success(null, 'Tenant deleted successfully');
        } catch (NotFoundException $e) {
            return ResponseFormatter::error($e->getMessage(), null, 404);
        } catch (UnauthorizedException $e) {
            return ResponseFormatter::error($e->getMessage(), null, 403);
        } catch (BusinessException $e) {
            return ResponseFormatter::error($e->getMessage(), null, 400);
        }
    }
}
