<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Barber;
use App\Models\Service;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __invoke()
    {
        $today = Carbon::today();
        $user = Auth::user();
        $isBarber = $user->hasRole('barber') && !$user->hasRole('shop-admin');
        $barberId = $isBarber ? $user->barber?->id : null;

        $appointmentQuery = fn () => Appointment::query()
            ->when($barberId, fn ($q) => $q->where('barber_id', $barberId));

        $stats = [
            'today_appointments' => $appointmentQuery()->whereDate('starts_at', $today)->count(),
            'active_services' => Service::where('is_active', true)->count(),
            'monthly_revenue' => $appointmentQuery()
                ->where('status', 'completed')
                ->whereMonth('starts_at', $today->month)
                ->whereYear('starts_at', $today->year)
                ->sum('price'),
        ];

        if (!$isBarber) {
            $stats['active_barbers'] = Barber::where('is_active', true)->count();
        }

        return Inertia::render('Dashboard', [
            'is_barber' => $isBarber,
            'stats' => $stats,
            'upcoming_appointments' => $appointmentQuery()
                ->with(['barber.user', 'customer', 'service'])
                ->where('starts_at', '>=', now())
                ->whereIn('status', ['scheduled', 'confirmed'])
                ->orderBy('starts_at')
                ->limit(5)
                ->get(),
            'recent_appointments' => $appointmentQuery()
                ->with(['barber.user', 'customer', 'service'])
                ->orderBy('starts_at', 'desc')
                ->limit(5)
                ->get(),
        ]);
    }
}
