<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Barber;
use App\Models\Customer;
use App\Models\Service;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __invoke()
    {
        $today = Carbon::today();

        return Inertia::render('Dashboard', [
            'stats' => [
                'today_appointments' => Appointment::whereDate('starts_at', $today)->count(),
                'total_customers' => Customer::count(),
                'active_barbers' => Barber::where('is_active', true)->count(),
                'active_services' => Service::where('is_active', true)->count(),
                'monthly_revenue' => Appointment::where('status', 'completed')
                    ->whereMonth('starts_at', $today->month)
                    ->whereYear('starts_at', $today->year)
                    ->sum('price'),
            ],
            'upcoming_appointments' => Appointment::with(['barber.user', 'customer', 'service'])
                ->where('starts_at', '>=', now())
                ->whereIn('status', ['scheduled', 'confirmed'])
                ->orderBy('starts_at')
                ->limit(5)
                ->get(),
            'recent_appointments' => Appointment::with(['barber.user', 'customer', 'service'])
                ->orderBy('starts_at', 'desc')
                ->limit(5)
                ->get(),
        ]);
    }
}
