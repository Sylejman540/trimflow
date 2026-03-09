<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Barber;
use App\Models\Customer;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', \App\Models\Appointment::class);

        $period = $request->get('period', 'this_month');
        [$start, $end] = $this->resolvePeriod($period);

        $baseQuery = fn () => Appointment::whereBetween('starts_at', [$start, $end]);

        // --- Summary KPIs ---
        $totalRevenue     = $baseQuery()->where('status', 'completed')->sum('price');
        $totalAppointments = $baseQuery()->count();
        $completedCount   = $baseQuery()->where('status', 'completed')->count();
        $noShowCount      = $baseQuery()->where('status', 'no_show')->count();
        $cancelledCount   = $baseQuery()->where('status', 'cancelled')->count();
        $newCustomers     = Customer::whereBetween('created_at', [$start, $end])->count();

        // --- Revenue by day ---
        $dailyRevenue = $baseQuery()
            ->where('status', 'completed')
            ->select(DB::raw('DATE(starts_at) as date'), DB::raw('SUM(price) as revenue'), DB::raw('COUNT(*) as bookings'))
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(fn ($row) => [
                'date'     => Carbon::parse($row->date)->format('M j'),
                'revenue'  => (int) $row->revenue,
                'bookings' => (int) $row->bookings,
            ]);

        // --- Revenue by service ---
        $byService = $baseQuery()
            ->where('status', 'completed')
            ->select('service_id', DB::raw('SUM(price) as revenue'), DB::raw('COUNT(*) as bookings'))
            ->groupBy('service_id')
            ->orderByDesc('revenue')
            ->get()
            ->map(fn ($row) => [
                'name'     => Service::find($row->service_id)?->name ?? 'Unknown',
                'revenue'  => (int) $row->revenue,
                'bookings' => (int) $row->bookings,
            ]);

        // --- Revenue by barber ---
        $byBarber = $baseQuery()
            ->where('status', 'completed')
            ->select('barber_id', DB::raw('SUM(price) as revenue'), DB::raw('COUNT(*) as bookings'))
            ->groupBy('barber_id')
            ->orderByDesc('revenue')
            ->get()
            ->map(fn ($row) => [
                'name'     => Barber::with('user')->find($row->barber_id)?->user?->name ?? 'Unknown',
                'revenue'  => (int) $row->revenue,
                'bookings' => (int) $row->bookings,
            ]);

        // --- Status breakdown ---
        $statusBreakdown = $baseQuery()
            ->select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->get()
            ->mapWithKeys(fn ($row) => [$row->status => (int) $row->count]);

        return Inertia::render('reports/Index', [
            'period'           => $period,
            'period_label'     => $this->periodLabel($period),
            'summary'          => [
                'total_revenue'      => (int) $totalRevenue,
                'total_appointments' => $totalAppointments,
                'completed'          => $completedCount,
                'no_shows'           => $noShowCount,
                'cancelled'          => $cancelledCount,
                'new_customers'      => $newCustomers,
                'completion_rate'    => $totalAppointments > 0
                    ? round(($completedCount / $totalAppointments) * 100)
                    : 0,
            ],
            'daily_revenue'    => $dailyRevenue,
            'by_service'       => $byService,
            'by_barber'        => $byBarber,
            'status_breakdown' => $statusBreakdown,
        ]);
    }

    private function resolvePeriod(string $period): array
    {
        return match ($period) {
            'today'        => [Carbon::today(),                  Carbon::today()->endOfDay()],
            'this_week'    => [Carbon::now()->startOfWeek(),     Carbon::now()->endOfWeek()],
            'last_month'   => [Carbon::now()->subMonth()->startOfMonth(), Carbon::now()->subMonth()->endOfMonth()],
            'last_3_months'=> [Carbon::now()->subMonths(3)->startOfMonth(), Carbon::now()->endOfMonth()],
            'this_year'    => [Carbon::now()->startOfYear(),     Carbon::now()->endOfYear()],
            default        => [Carbon::now()->startOfMonth(),    Carbon::now()->endOfMonth()], // this_month
        };
    }

    private function periodLabel(string $period): string
    {
        return match ($period) {
            'today'         => 'Today',
            'this_week'     => 'This Week',
            'last_month'    => 'Last Month',
            'last_3_months' => 'Last 3 Months',
            'this_year'     => 'This Year',
            default         => 'This Month',
        };
    }
}
