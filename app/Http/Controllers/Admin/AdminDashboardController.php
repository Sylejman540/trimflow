<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Company;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AdminDashboardController extends Controller
{
    public function __invoke()
    {
        abort_unless(auth()->user()->hasRole('platform-admin'), 403);

        // ── Companies ─────────────────────────────────────────────────────────
        $companies = Company::withCount(['users', 'barbers', 'appointments', 'customers'])
            ->withSum(['appointments as revenue' => fn ($q) => $q->where('status', 'completed')], 'price')
            ->withMax('appointments as last_booking_at', 'created_at')
            ->orderByDesc('appointments_count')
            ->get()
            ->map(fn ($c) => [
                'id'                 => $c->id,
                'name'               => $c->name,
                'slug'               => $c->slug,
                'email'              => $c->email,
                'phone'              => $c->phone,
                'address'            => $c->address,
                'is_active'          => $c->is_active,
                'created_at'         => Carbon::parse($c->created_at)->format('M j, Y'),
                'users_count'        => $c->users_count,
                'barbers_count'      => $c->barbers_count,
                'appointments_count' => $c->appointments_count,
                'customers_count'    => $c->customers_count,
                'revenue'            => (int) ($c->revenue ?? 0),
                'last_booking_at'    => $c->last_booking_at
                    ? Carbon::parse($c->last_booking_at)->diffForHumans()
                    : 'Never',
            ]);

        // ── Platform-wide totals ───────────────────────────────────────────────
        $totalAppts      = Appointment::count();
        $cancelledAppts  = Appointment::whereIn('status', ['cancelled', 'no_show'])->count();
        $todayAppts      = Appointment::whereDate('starts_at', today())->count();
        $totalRevenue    = (int) Appointment::where('status', 'completed')->sum('price');
        $monthRevenue    = (int) Appointment::where('status', 'completed')
            ->whereMonth('starts_at', now()->month)
            ->whereYear('starts_at', now()->year)
            ->sum('price');
        $prevMonthRevenue = (int) Appointment::where('status', 'completed')
            ->whereMonth('starts_at', now()->subMonth()->month)
            ->whereYear('starts_at', now()->subMonth()->year)
            ->sum('price');

        $totals = [
            'companies'           => Company::count(),
            'active_companies'    => Company::where('is_active', true)->count(),
            'users'               => User::count(),
            'appointments'        => $totalAppts,
            'appointments_today'  => $todayAppts,
            'revenue'             => $totalRevenue,
            'revenue_this_month'  => $monthRevenue,
            'revenue_prev_month'  => $prevMonthRevenue,
            'customers'           => Customer::count(),
            'cancellation_rate'   => $totalAppts > 0
                ? (int) round($cancelledAppts / $totalAppts * 100)
                : 0,
        ];

        // ── Bookings per day — last 30 days ────────────────────────────────────
        $raw = Appointment::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as bookings')
            )
            ->where('created_at', '>=', now()->subDays(29)->startOfDay())
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        $chartData = [];
        for ($i = 29; $i >= 0; $i--) {
            $d = now()->subDays($i)->toDateString();
            $chartData[] = [
                'date'     => now()->subDays($i)->format('M j'),
                'bookings' => (int) ($raw[$d]->bookings ?? 0),
            ];
        }

        // ── Revenue per month — last 6 months ─────────────────────────────────
        $revenueMonths = [];
        for ($i = 5; $i >= 0; $i--) {
            $m   = now()->subMonths($i);
            $rev = (int) Appointment::where('status', 'completed')
                ->whereYear('starts_at', $m->year)
                ->whereMonth('starts_at', $m->month)
                ->sum('price');
            $revenueMonths[] = ['month' => $m->format('M'), 'revenue' => $rev];
        }

        // ── Appointments by status (all time) ─────────────────────────────────
        $byStatus = Appointment::select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->get()
            ->keyBy('status');

        $statusBreakdown = collect(['confirmed', 'completed', 'cancelled', 'pending', 'no_show', 'in_progress'])
            ->map(fn ($s) => ['status' => $s, 'count' => (int) ($byStatus[$s]->count ?? 0)])
            ->values();

        // ── Top 5 shops by revenue this month ─────────────────────────────────
        $topShops = Company::withSum(
                ['appointments as month_revenue' => fn ($q) => $q
                    ->where('status', 'completed')
                    ->whereMonth('starts_at', now()->month)
                    ->whereYear('starts_at', now()->year)],
                'price'
            )
            ->orderByDesc('month_revenue')
            ->limit(5)
            ->get()
            ->map(fn ($c) => [
                'name'    => $c->name,
                'revenue' => (int) ($c->month_revenue ?? 0),
            ]);

        // ── Recent activity ────────────────────────────────────────────────────
        $recentActivity = Appointment::with(['company', 'customer', 'service', 'barber.user'])
            ->latest()
            ->limit(30)
            ->get()
            ->map(fn ($a) => [
                'id'           => $a->id,
                'company_name' => $a->company?->name,
                'company_slug' => $a->company?->slug,
                'customer'     => $a->customer?->name ?? 'Unknown',
                'service'      => $a->service?->name ?? '—',
                'barber'       => $a->barber?->user?->name ?? '—',
                'status'       => $a->status,
                'starts_at'    => $a->starts_at->format('M j, g:i A'),
                'created_at'   => $a->created_at->diffForHumans(),
            ]);

        // ── New shops — last 7 days ────────────────────────────────────────────
        $newShops = Company::where('created_at', '>=', now()->subDays(7))
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($c) => [
                'id'         => $c->id,
                'name'       => $c->name,
                'slug'       => $c->slug,
                'is_active'  => $c->is_active,
                'created_at' => Carbon::parse($c->created_at)->diffForHumans(),
            ]);

        return Inertia::render('admin/Dashboard', [
            'companies'        => $companies,
            'totals'           => $totals,
            'chart_data'       => $chartData,
            'revenue_months'   => $revenueMonths,
            'status_breakdown' => $statusBreakdown,
            'top_shops'        => $topShops,
            'recent_activity'  => $recentActivity,
            'new_shops'        => $newShops,
        ]);
    }

    public function toggleCompany(Company $company)
    {
        abort_unless(auth()->user()->hasRole('platform-admin'), 403);

        $company->update(['is_active' => ! $company->is_active]);

        return back()->with('success', $company->is_active ? 'Shop activated.' : 'Shop deactivated.');
    }
}
