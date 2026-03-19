<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckEmailVerified
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // If user is not authenticated, let them through (auth middleware will handle)
        if (!$request->user()) {
            return $next($request);
        }

        // If email is verified, let them through
        if ($request->user()->hasVerifiedEmail()) {
            return $next($request);
        }

        // If email is not verified, redirect to verification page
        return redirect()->route('verification.notice');
    }
}
