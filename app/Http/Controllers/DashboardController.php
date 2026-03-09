<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Barber;
use App\Models\Product;
use App\Models\Service;
use App\Models\ShopGoal;
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
            ->get()
            ->map(fn (Appointment $a) => $this->mapAppointment($a));

        $goal = ShopGoal::where('month', $today->month)->where('year', $today->year)->first();

        // Low-stock products alert (admin only)
        $lowStockProducts = $isBarber ? [] : Product::where('is_active', true)
            ->whereColumn('stock_qty', '<=', 'low_stock_threshold')
            ->orderBy('stock_qty')
            ->get(['id', 'name', 'stock_qty', 'low_stock_threshold'])
            ->toArray();

        return Inertia::render('Dashboard', [
            'is_barber'          => $isBarber,
            'low_stock_products' => $lowStockProducts,
            'stats'       => $stats,
            'goal'        => $goal ? [
                'revenue_target'  => $goal->revenue_target,
                'bookings_target' => $goal->bookings_target,
                'month'           => $goal->month,
                'year'            => $goal->year,
            ] : null,
            'chart_data'  => $chartData,
            'barber_performance' => $barberPerformance,
            'today_schedule'     => $todaySchedule,
            'upcoming_appointments' => $appointmentQuery()
                ->with(['barber.user', 'customer', 'service'])
                ->where('starts_at', '>=', now())
                ->whereIn('status', ['confirmed', 'in_progress'])
                ->orderBy('starts_at')
                ->limit(5)
                ->get()
                ->map(fn (Appointment $a) => $this->mapAppointment($a)),
        ]);
    }

    private function mapAppointment(Appointment $a): array
    {
        return [
            'id'         => $a->id,
            'starts_at'  => $a->starts_at->toIso8601String(),
            'ends_at'    => $a->ends_at->toIso8601String(),
            'status'     => $a->status,
            'price'      => $a->price,
            'notes'      => $a->notes,
            'customer'   => $a->customer ? ['id' => $a->customer->id, 'name' => $a->customer->name] : null,
            'service'    => $a->service  ? ['id' => $a->service->id,  'name' => $a->service->name]  : null,
            'barber'     => $a->barber   ? ['id' => $a->barber->id,   'user' => ['name' => $a->barber->user?->name]] : null,
        ];
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
