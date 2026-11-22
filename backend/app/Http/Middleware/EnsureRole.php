<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    public function handle(Request $request, Closure $next, string $role): Response
    {
        if (! $request->user() || $request->user()->role !== $role) {
            return response()->json([
                'message' => 'Accès refusé.',
            ], Response::HTTP_FORBIDDEN);
        }

        if (! $request->user()->is_active) {
            return response()->json([
                'message' => 'Votre compte a été désactivé.',
            ], Response::HTTP_FORBIDDEN);
        }

        return $next($request);
    }
}
