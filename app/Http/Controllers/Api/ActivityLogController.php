<?php

namespace App\Http\Controllers\Api;

use App\Exceptions\NotFoundException;
use App\Exceptions\UnauthorizedException;
use App\Helpers\ResponseFormatter;
use App\Http\Controllers\Controller;
use App\Services\ActivityLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @OA\Tag(
 *     name="Activity Logs",
 *     description="API Endpoints for activity logs (Super Admin only)"
 * )
 */
class ActivityLogController extends Controller
{
    public function __construct(
        private readonly ActivityLogService $activityLogService
    ) {}

    /**
     * @OA\Get(
     *     path="/api/logs",
     *     tags={"Activity Logs"},
     *     summary="Get all activity logs (Super Admin only)",
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Parameter(
     *         name="tenant_uuid",
     *         in="query",
     *         required=false,
     *         description="Filter by tenant UUID",
     *
     *         @OA\Schema(type="string", format="uuid")
     *     ),
     *
     *     @OA\Parameter(
     *         name="user_uuid",
     *         in="query",
     *         required=false,
     *         description="Filter by user UUID",
     *
     *         @OA\Schema(type="string", format="uuid")
     *     ),
     *
     *     @OA\Parameter(
     *         name="log_type",
     *         in="query",
     *         required=false,
     *         description="Filter by log type (created, updated, deleted)",
     *
     *         @OA\Schema(type="string", enum={"created", "updated", "deleted"})
     *     ),
     *
     *     @OA\Parameter(
     *         name="model_type",
     *         in="query",
     *         required=false,
     *         description="Filter by model type",
     *
     *         @OA\Schema(type="string")
     *     ),
     *
     *     @OA\Response(response=200, description="Logs retrieved successfully"),
     *     @OA\Response(response=401, description="Unauthenticated"),
     *     @OA\Response(response=403, description="Unauthorized - Super Admin only")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $logs = $this->activityLogService->getAll(
                auth()->user(),
                $request->input('tenant_uuid'),
                $request->input('user_uuid'),
                $request->input('log_type'),
                $request->input('model_type'),
                $request->input('per_page', 20)
            );

            return ResponseFormatter::paginated($logs, 'Activity logs retrieved successfully');
        } catch (UnauthorizedException $e) {
            return ResponseFormatter::error($e->getMessage(), null, 403);
        }
    }

    /**
     * @OA\Get(
     *     path="/api/logs/{uuid}",
     *     tags={"Activity Logs"},
     *     summary="Get a single activity log (Super Admin only)",
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
     *     @OA\Response(response=200, description="Log retrieved successfully"),
     *     @OA\Response(response=401, description="Unauthenticated"),
     *     @OA\Response(response=403, description="Unauthorized - Super Admin only"),
     *     @OA\Response(response=404, description="Log not found")
     * )
     */
    public function show(string $uuid): JsonResponse
    {
        try {
            $log = $this->activityLogService->getByUuid($uuid, auth()->user());

            return ResponseFormatter::success($log, 'Activity log retrieved successfully');
        } catch (NotFoundException $e) {
            return ResponseFormatter::error($e->getMessage(), null, 404);
        } catch (UnauthorizedException $e) {
            return ResponseFormatter::error($e->getMessage(), null, 403);
        }
    }
}
