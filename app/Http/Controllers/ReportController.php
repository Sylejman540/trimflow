<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Barber;
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
        abort_unless(Auth::user()->hasAnyRole(['shop-admin', 'platform-admin']), 403);

        $period = $request->input('period', 'this_month');

        [$start, $end] = $this->periodRange($period);

        // Revenue by day
        $revenueByDay = Appointment::where('status', 'completed')
            ->whereBetween('starts_at', [$start, $end])
            ->select(DB::raw('DATE(starts_at) as date'), DB::raw('SUM(price) as revenue'), DB::raw('COUNT(*) as count'))
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(fn ($r) => [
                'date'    => Carbon::parse($r->date)->format('M j'),
                'revenue' => (int) $r->revenue,
                'count'   => (int) $r->count,
            ]);

        // Revenue by barber
        $revenueByBarber = DB::table('appointments')
            ->join('barbers', 'appointments.barber_id', '=', 'barbers.id')
            ->join('users', 'barbers.user_id', '=', 'users.id')
            ->where('appointments.status', 'completed')
            ->whereBetween('appointments.starts_at', [$start, $end])
            ->select(
                'users.name',
                DB::raw('SUM(appointments.price) as revenue'),
                DB::raw('COUNT(*) as count'),
                DB::raw("SUM(CASE WHEN appointments.status='no_show' THEN 1 ELSE 0 END) as no_shows"),
            )
            ->groupBy('users.id', 'users.name')
            ->orderByDesc('revenue')
            ->get()
            ->map(fn ($r) => [
                'name'    => $r->name,
                'revenue' => (int) $r->revenue,
                'count'   => (int) $r->count,
            ]);

        // Revenue by service
        $revenueByService = DB::table('appointments')
            ->join('services', 'appointments.service_id', '=', 'services.id')
            ->where('appointments.status', 'completed')
            ->whereBetween('appointments.starts_at', [$start, $end])
            ->select(
                'services.name',
                DB::raw('SUM(appointments.price) as revenue'),
                DB::raw('COUNT(*) as count'),
            )
            ->groupBy('services.id', 'services.name')
            ->orderByDesc('revenue')
            ->get()
            ->map(fn ($r) => [
                'name'    => $r->name,
                'revenue' => (int) $r->revenue,
                'count'   => (int) $r->count,
            ]);

        // Summary totals
        $totals = Appointment::whereBetween('starts_at', [$start, $end])
            ->select(
                DB::raw('SUM(CASE WHEN status="completed" THEN price ELSE 0 END) as revenue'),
                DB::raw('COUNT(*) as total'),
                DB::raw('SUM(CASE WHEN status="completed" THEN 1 ELSE 0 END) as completed'),
                DB::raw('SUM(CASE WHEN status="cancelled" THEN 1 ELSE 0 END) as cancelled'),
                DB::raw('SUM(CASE WHEN status="no_show" THEN 1 ELSE 0 END) as no_shows'),
                DB::raw('SUM(CASE WHEN status="completed" THEN tip_amount ELSE 0 END) as tips'),
            )
            ->first();

        return Inertia::render('reports/Index', [
            'period'           => $period,
            'revenue_by_day'   => $revenueByDay,
            'revenue_by_barber'=> $revenueByBarber,
            'revenue_by_service'=> $revenueByService,
            'totals'           => [
                'revenue'   => (int) ($totals->revenue ?? 0),
                'tips'      => (int) ($totals->tips ?? 0),
                'total'     => (int) ($totals->total ?? 0),
                'completed' => (int) ($totals->completed ?? 0),
                'cancelled' => (int) ($totals->cancelled ?? 0),
                'no_shows'  => (int) ($totals->no_shows ?? 0),
            ],
            'period_label' => $this->periodLabel($period),
        ]);
    }

    private function periodRange(string $period): array
    {
        $today = Carbon::today();

        return match ($period) {
            'today'        => [$today->copy()->startOfDay(), $today->copy()->endOfDay()],
            'this_week'    => [$today->copy()->startOfWeek(), $today->copy()->endOfWeek()],
            'last_week'    => [$today->copy()->subWeek()->startOfWeek(), $today->copy()->subWeek()->endOfWeek()],
            'last_month'   => [$today->copy()->subMonth()->startOfMonth(), $today->copy()->subMonth()->endOfMonth()],
            'this_year'    => [$today->copy()->startOfYear(), $today->copy()->endOfYear()],
            default        => [$today->copy()->startOfMonth(), $today->copy()->endOfMonth()], // this_month
        };
    }

    private function periodLabel(string $period): string
    {
        return match ($period) {
            'today'      => 'Today',
            'this_week'  => 'This Week',
            'last_week'  => 'Last Week',
            'last_month' => 'Last Month',
            'this_year'  => 'This Year',
            default      => 'This Month',
        };
    }
}
