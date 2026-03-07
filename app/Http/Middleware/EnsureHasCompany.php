<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureHasCompany
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user() && !$request->user()->company_id) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'No company assigned.'], 403);
            }

            return redirect()->route('onboarding');
        }

        return $next($request);
    }
}
