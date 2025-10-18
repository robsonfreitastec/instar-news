<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TenantMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = auth()->user();

        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated',
            ], 401);
        }

        if ($user->isSuperAdmin()) {
            $tenantId = $request->header('X-Tenant-ID') ?? $request->query('tenant_id');
            if ($tenantId) {
                $request->merge(['tenant_id' => $tenantId]);
            }

            return $next($request);
        }

        $tenantId = $request->header('X-Tenant-ID') ?? $request->query('tenant_id');

        if (! $tenantId) {
            $firstTenant = $user->tenants()->first();
            if ($firstTenant) {
                $tenantId = $firstTenant->id;
            }
        }

        if (! $tenantId) {
            return response()->json([
                'success' => false,
                'message' => 'No tenant associated with this user',
            ], 403);
        }

        if (! $user->belongsToTenant($tenantId)) {
            return response()->json([
                'success' => false,
                'message' => 'User does not belong to this tenant',
            ], 403);
        }

        $request->merge(['tenant_id' => $tenantId]);

        return $next($request);
    }
}
