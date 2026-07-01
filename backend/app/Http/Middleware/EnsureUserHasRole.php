<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user || ($roles !== [] && ! $user->hasAnyRole($roles))) {
            abort(Response::HTTP_FORBIDDEN, 'You do not have permission to access this resource.');
        }

        return $next($request);
    }
}
