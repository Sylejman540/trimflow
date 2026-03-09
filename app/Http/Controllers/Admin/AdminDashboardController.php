<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\User;
use App\Models\Appointment;
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

        return Inertia::render('admin/Dashboard', [
            'companies' => $companies,
            'totals'    => $totals,
        ]);
    }
}
