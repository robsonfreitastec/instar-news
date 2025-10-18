<?php

namespace App\Http\Controllers\Api;

use App\Exceptions\NotFoundException;
use App\Exceptions\UnauthorizedException;
use App\Helpers\ResponseFormatter;
use App\Http\Controllers\Controller;
use App\Http\Requests\News\CreateNewsRequest;
use App\Http\Requests\News\UpdateNewsRequest;
use App\Models\News;
use App\Services\NewsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @OA\Tag(
 *     name="News",
 *     description="API Endpoints for news management"
 * )
 */
class NewsController extends Controller
{
    public function __construct(
        private readonly NewsService $newsService
    ) {}

    /**
     * @OA\Get(
     *     path="/api/news",
     *     tags={"News"},
     *     summary="Get all news",
     *     description="Retrieve a paginated list of news. Super admins can see all news, while regular users only see news from their tenants.",
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Parameter(
     *         name="tenant_uuid",
     *         in="query",
     *         required=false,
     *         description="Filter by tenant UUID (Super Admin only)",
     *
     *         @OA\Schema(type="string", format="uuid")
     *     ),
     *
     *     @OA\Parameter(
     *         name="author_uuid",
     *         in="query",
     *         description="Filter by author/user UUID",
     *
     *         @OA\Schema(type="string", format="uuid")
     *     ),
     *
     *     @OA\Parameter(
     *         name="search",
     *         in="query",
     *         description="Search in title and content",
     *
     *         @OA\Schema(type="string")
     *     ),
     *
     *     @OA\Parameter(
     *         name="page",
     *         in="query",
     *         description="Page number",
     *
     *         @OA\Schema(type="integer", default=1)
     *     ),
     *
     *     @OA\Parameter(
     *         name="per_page",
     *         in="query",
     *         description="Items per page",
     *
     *         @OA\Schema(type="integer", default=15)
     *     ),
     *
     *     @OA\Response(response=200, description="News retrieved successfully"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $news = $this->newsService->getAll(
            auth()->user(),
            $request->input('tenant_uuid'),
            $request->input('author_uuid'),
            $request->input('search'),
            $request->input('per_page', 15)
        );

        return ResponseFormatter::paginated($news, 'News retrieved successfully');
    }

    /**
     * @OA\Post(
     *     path="/api/news",
     *     tags={"News"},
     *     summary="Create news",
     *     description="Create a new news article. Regular users: uses first tenant automatically. Super Admin: must specify tenant_uuid.",
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\RequestBody(
     *         required=true,
     *
     *         @OA\JsonContent(
     *             required={"title","content"},
     *
     *             @OA\Property(property="title", type="string", example="Breaking News"),
     *             @OA\Property(property="content", type="string", example="This is the news content..."),
     *             @OA\Property(property="tenant_uuid", type="string", format="uuid", description="Tenant UUID (required for Super Admin, optional for regular users)")
     *         )
     *     ),
     *
     *     @OA\Response(response=201, description="News created successfully"),
     *     @OA\Response(response=401, description="Unauthenticated"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function store(CreateNewsRequest $request): JsonResponse
    {
        try {
            $news = $this->newsService->create(
                $request->validated(),
                auth()->user(),
                $request->input('tenant_uuid')
            );

            return ResponseFormatter::success($news, 'News created successfully', 201);
        } catch (\App\Exceptions\NotFoundException $e) {
            return ResponseFormatter::error($e->getMessage(), null, 404);
        } catch (\App\Exceptions\UnauthorizedException $e) {
            return ResponseFormatter::error($e->getMessage(), null, 403);
        } catch (\App\Exceptions\BusinessException $e) {
            return ResponseFormatter::error($e->getMessage(), null, 400);
        }
    }

    /**
     * @OA\Get(
     *     path="/api/news/{uuid}",
     *     tags={"News"},
     *     summary="Get a single news",
     *     description="Retrieve a specific news article by UUID",
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Parameter(
     *         name="uuid",
     *         in="path",
     *         required=true,
     *         description="News UUID",
     *
     *         @OA\Schema(type="string", format="uuid")
     *     ),
     *
     *     @OA\Response(response=200, description="News retrieved successfully"),
     *     @OA\Response(response=401, description="Unauthenticated"),
     *     @OA\Response(response=403, description="Forbidden"),
     *     @OA\Response(response=404, description="News not found")
     * )
     */
    public function show(string $uuid): JsonResponse
    {
        try {
            $news = $this->newsService->getByUuid($uuid, auth()->user());

            return ResponseFormatter::success($news, 'News retrieved successfully');
        } catch (NotFoundException $e) {
            return ResponseFormatter::error($e->getMessage(), null, 404);
        } catch (UnauthorizedException $e) {
            return ResponseFormatter::error($e->getMessage(), null, 403);
        }
    }

    /**
     * @OA\Put(
     *     path="/api/news/{uuid}",
     *     tags={"News"},
     *     summary="Update news",
     *     description="Update an existing news article",
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Parameter(
     *         name="uuid",
     *         in="path",
     *         required=true,
     *         description="News UUID",
     *
     *         @OA\Schema(type="string", format="uuid")
     *     ),
     *
     *     @OA\RequestBody(
     *         required=true,
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="title", type="string", example="Updated Title"),
     *             @OA\Property(property="content", type="string", example="Updated content...")
     *         )
     *     ),
     *
     *     @OA\Response(response=200, description="News updated successfully"),
     *     @OA\Response(response=401, description="Unauthenticated"),
     *     @OA\Response(response=403, description="Forbidden"),
     *     @OA\Response(response=404, description="News not found"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function update(UpdateNewsRequest $request, string $uuid): JsonResponse
    {
        try {
            $news = $this->newsService->findByUuid($uuid);

            if (! $news) {
                throw new NotFoundException('News not found');
            }

            $updatedNews = $this->newsService->update($news, $request->validated(), auth()->user());

            return ResponseFormatter::success($updatedNews, 'News updated successfully');
        } catch (NotFoundException $e) {
            return ResponseFormatter::error($e->getMessage(), null, 404);
        } catch (UnauthorizedException $e) {
            return ResponseFormatter::error($e->getMessage(), null, 403);
        }
    }

    /**
     * @OA\Delete(
     *     path="/api/news/{uuid}",
     *     tags={"News"},
     *     summary="Delete news",
     *     description="Delete a news article (soft delete)",
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Parameter(
     *         name="uuid",
     *         in="path",
     *         required=true,
     *         description="News UUID",
     *
     *         @OA\Schema(type="string", format="uuid")
     *     ),
     *
     *     @OA\Response(response=200, description="News deleted successfully"),
     *     @OA\Response(response=401, description="Unauthenticated"),
     *     @OA\Response(response=403, description="Forbidden"),
     *     @OA\Response(response=404, description="News not found")
     * )
     */
    public function destroy(string $uuid): JsonResponse
    {
        try {
            $news = $this->newsService->findByUuid($uuid);

            if (! $news) {
                throw new NotFoundException('News not found');
            }

            $this->newsService->delete($news, auth()->user());

            return ResponseFormatter::success(null, 'News deleted successfully');
        } catch (NotFoundException $e) {
            return ResponseFormatter::error($e->getMessage(), null, 404);
        } catch (UnauthorizedException $e) {
            return ResponseFormatter::error($e->getMessage(), null, 403);
        }
    }
}
