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
                'users_count'        => $c->users_count,
                'barbers_count'      => $c->barbers_count,
                'appointments_count' => $c->appointments_count,
                'customers_count'    => $c->customers_count,
                'revenue'            => (int) ($c->revenue ?? 0),
                'last_booking_at'    => $c->last_booking_at
                    ? Carbon::parse($c->last_booking_at)->diffForHumans()
                    : 'Never',
            ]);

        // Platform-wide totals
        $totals = [
            'companies'            => Company::count(),
            'active_companies'     => Company::where('is_active', true)->count(),
            'users'                => User::count(),
            'appointments'         => Appointment::count(),
            'appointments_today'   => Appointment::whereDate('starts_at', today())->count(),
            'revenue'              => (int) Appointment::where('status', 'completed')->sum('price'),
            'revenue_this_month'   => (int) Appointment::where('status', 'completed')
                ->whereMonth('starts_at', now()->month)
                ->whereYear('starts_at', now()->year)
                ->sum('price'),
            'customers'            => Customer::count(),
            'cancellation_rate'    => $this->cancellationRate(),
        ];

        // Bookings per day for the last 14 days (sparkline data)
        $bookingsByDay = Appointment::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as count')
            )
            ->where('created_at', '>=', now()->subDays(13)->startOfDay())
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date')
            ->map(fn ($r) => $r->count);

        // Fill in zeros for missing days
        $sparkline = [];
        for ($i = 13; $i >= 0; $i--) {
            $d = now()->subDays($i)->toDateString();
            $sparkline[] = ['date' => $d, 'count' => (int) ($bookingsByDay[$d] ?? 0)];
        }

        // Top 5 shops by revenue this month
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

        // Recent activity: last 25 appointments across all companies
        $recentActivity = Appointment::with(['company', 'customer', 'service', 'barber.user'])
            ->latest()
            ->limit(25)
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

        return Inertia::render('admin/Dashboard', [
            'companies'       => $companies,
            'totals'          => $totals,
            'sparkline'       => $sparkline,
            'top_shops'       => $topShops,
            'recent_activity' => $recentActivity,
        ]);
    }

    public function toggleCompany(Company $company)
    {
        abort_unless(auth()->user()->hasRole('platform-admin'), 403);

        $company->update(['is_active' => ! $company->is_active]);

        return back()->with('success', $company->is_active ? 'Shop activated.' : 'Shop deactivated.');
    }

    private function cancellationRate(): int
    {
        $total = Appointment::whereIn('status', ['completed', 'cancelled', 'no_show'])->count();
        if ($total === 0) return 0;
        $cancelled = Appointment::whereIn('status', ['cancelled', 'no_show'])->count();
        return (int) round($cancelled / $total * 100);
    }
}
