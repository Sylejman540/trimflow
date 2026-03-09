<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Barber;
use App\Models\Service;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
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

        $weekStart = $today->copy()->startOfWeek();
        $weekEnd = $today->copy()->endOfWeek();
        $monthStart = $today->copy()->startOfMonth();
        $monthEnd = $today->copy()->endOfMonth();
        $prevMonthStart = $today->copy()->subMonth()->startOfMonth();
        $prevMonthEnd = $today->copy()->subMonth()->endOfMonth();

        $stats = [
            'today_appointments' => $appointmentQuery()
                ->whereDate('starts_at', $today)->count(),
            'weekly_bookings' => $appointmentQuery()
                ->whereBetween('starts_at', [$weekStart, $weekEnd])->count(),
            'monthly_bookings' => $appointmentQuery()
                ->whereBetween('starts_at', [$monthStart, $monthEnd])->count(),
            'monthly_revenue' => $appointmentQuery()
                ->where('status', 'completed')
                ->whereBetween('starts_at', [$monthStart, $monthEnd])
                ->sum('price'),
            'prev_month_revenue' => $appointmentQuery()
                ->where('status', 'completed')
                ->whereBetween('starts_at', [$prevMonthStart, $prevMonthEnd])
                ->sum('price'),
            'completion_rate' => $this->completionRate($appointmentQuery, $monthStart, $monthEnd),
        ];

        if (!$isBarber) {
            $stats['active_barbers'] = Barber::where('is_active', true)->count();
        }

        // Most popular service this month
        $popularService = $appointmentQuery()
            ->whereBetween('starts_at', [$monthStart, $monthEnd])
            ->select('service_id', DB::raw('count(*) as count'))
            ->groupBy('service_id')
            ->orderByDesc('count')
            ->first();

        $stats['popular_service'] = $popularService
            ? Service::find($popularService->service_id)?->name
            : null;
        $stats['popular_service_count'] = $popularService?->count ?? 0;

        // Daily bookings for last 14 days (chart data)
        $chartStart = $today->copy()->subDays(13);
        $dailyBookings = $appointmentQuery()
            ->whereBetween('starts_at', [$chartStart, $today->copy()->endOfDay()])
            ->select(DB::raw('DATE(starts_at) as date'), DB::raw('count(*) as bookings'))
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        $chartData = [];
        for ($d = $chartStart->copy(); $d->lte($today); $d->addDay()) {
            $key = $d->format('Y-m-d');
            $chartData[] = [
                'date' => $d->format('M j'),
                'bookings' => (int) ($dailyBookings[$key]->bookings ?? 0),
            ];
        }

        // Barber performance (admin only)
        $barberPerformance = [];
        if (!$isBarber) {
            $barberPerformance = Barber::with('user')
                ->where('is_active', true)
                ->get()
                ->map(function (Barber $barber) use ($monthStart, $monthEnd) {
                    $appts = $barber->appointments()
                        ->whereBetween('starts_at', [$monthStart, $monthEnd]);
                    $total     = $appts->count();
                    $completed = (clone $appts)->where('status', 'completed')->count();
                    $revenue   = (clone $appts)->where('status', 'completed')->sum('price');
                    $noShows   = (clone $appts)->where('status', 'no_show')->count();
                    $avgRating = round(
                        $barber->reviews()
                            ->whereBetween('created_at', [$monthStart, $monthEnd])
                            ->avg('rating') ?? 0,
                        1
                    );
                    return [
                        'id'           => $barber->id,
                        'name'         => $barber->user?->name ?? '-',
                        'appointments' => $total,
                        'completed'    => $completed,
                        'revenue'      => $revenue,
                        'no_shows'     => $noShows,
                        'avg_rating'   => $avgRating,
                    ];
                })
                ->sortByDesc('revenue')
                ->values()
                ->all();
        }

        // Today's schedule
        $todaySchedule = $appointmentQuery()
            ->with(['barber.user', 'customer', 'service'])
            ->whereDate('starts_at', $today)
            ->orderBy('starts_at')
            ->get();

        return Inertia::render('Dashboard', [
            'is_barber' => $isBarber,
            'stats' => $stats,
            'chart_data' => $chartData,
            'barber_performance' => $barberPerformance,
            'today_schedule' => $todaySchedule,
            'upcoming_appointments' => $appointmentQuery()
                ->with(['barber.user', 'customer', 'service'])
                ->where('starts_at', '>=', now())
                ->whereIn('status', ['scheduled', 'confirmed'])
                ->orderBy('starts_at')
                ->limit(5)
                ->get(),
        ]);
    }

    private function completionRate(callable $query, Carbon $start, Carbon $end): int
    {
        $total = $query()
            ->whereBetween('starts_at', [$start, $end])
            ->whereIn('status', ['completed', 'cancelled', 'no_show'])
            ->count();

        if ($total === 0) return 0;

        $completed = $query()
            ->whereBetween('starts_at', [$start, $end])
            ->where('status', 'completed')
            ->count();

        return (int) round(($completed / $total) * 100);
    }
}
