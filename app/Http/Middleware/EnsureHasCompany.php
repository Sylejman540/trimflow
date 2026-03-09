<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureHasCompany
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && !$user->company_id) {
            // Platform admins don't belong to a company — send them to their panel
            if ($user->hasRole('platform-admin')) {
                if ($request->is('admin*')) {
                    return $next($request);
                }
                return redirect()->route('admin.dashboard');
            }

            if ($request->expectsJson()) {
                return response()->json(['message' => 'No company assigned.'], 403);
            }

            return redirect()->route('onboarding');
        }

        return $next($request);
    }
}
