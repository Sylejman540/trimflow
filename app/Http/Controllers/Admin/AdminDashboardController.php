<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Company;
use App\Models\User;
use Inertia\Inertia;

class AdminDashboardController extends Controller
{
    public function __invoke()
    {
        abort_unless(auth()->user()->hasRole('platform-admin'), 403);

        $companies = Company::withCount(['users', 'barbers', 'appointments'])
            ->withSum(['appointments as revenue' => fn ($q) => $q->where('status', 'completed')], 'price')
            ->orderBy('name')
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
                'revenue'            => (int) ($c->revenue ?? 0),
            ]);

        $totals = [
            'companies'    => $companies->count(),
            'users'        => User::count(),
            'appointments' => Appointment::count(),
            'revenue'      => (int) Appointment::where('status', 'completed')->sum('price'),
        ];

        // Recent activity: last 20 appointments across all companies
        $recentActivity = Appointment::with(['company', 'customer', 'service', 'barber.user'])
            ->latest()
            ->limit(20)
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
            'companies'      => $companies,
            'totals'         => $totals,
            'recent_activity' => $recentActivity,
        ]);
    }

    public function toggleCompany(Company $company)
    {
        abort_unless(auth()->user()->hasRole('platform-admin'), 403);

        $company->update(['is_active' => ! $company->is_active]);

        return back()->with('success', $company->is_active ? 'Shop activated.' : 'Shop deactivated.');
    }
}
