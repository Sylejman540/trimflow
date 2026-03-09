<?php

namespace App\Http\Middleware;

use App\Models\Barber;
use App\Models\Service;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
                'company' => $request->user()?->company,
                'roles' => $request->user()?->getRoleNames() ?? [],
                'permissions' => $request->user()?->getAllPermissions()->pluck('name') ?? [],
                'unread_notifications' => $request->user()?->unreadNotifications()->count() ?? 0,
            ],
            'ziggy' => fn () => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            'walkin' => function () use ($request) {
                $user = $request->user();
                if (! $user || ! $user->can('create', \App\Models\Appointment::class)) {
                    return null;
                }
                $isBarber = $user->hasRole('barber') && ! $user->hasRole('shop-admin');
                return [
                    'is_barber' => $isBarber,
                    'barbers'   => $isBarber ? [] : Barber::with('user')->where('is_active', true)->get(['id', 'user_id'])->map(fn ($b) => ['id' => $b->id, 'user' => ['name' => $b->user?->name]]),
                    'services'  => Service::where('is_active', true)->orderBy('name')->get(['id', 'name', 'duration', 'price']),
                ];
            },
        ];
    }
}
