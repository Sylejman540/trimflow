<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Company;
use Inertia\Inertia;

class BookingStatusController extends Controller
{
    public function __invoke(string $slug, string $token)
    {
        $company = Company::where('slug', $slug)->where('is_active', true)->firstOrFail();

        $appointment = Appointment::with(['barber.user', 'services'])
            ->where('cancel_token', $token)
            ->where('company_id', $company->id)
            ->firstOrFail();

        return Inertia::render('booking/portal/Status', [
            'company'     => array_merge(
                $company->only('id', 'name', 'slug'),
                ['logo' => $company->logo ? asset('storage/' . $company->logo) : null]
            ),
            'appointment' => [
                'status'   => $appointment->status,
                'starts_at'=> $appointment->starts_at->toIso8601String(),
                'barber'   => $appointment->barber?->user?->name,
                'services' => $appointment->services->pluck('name')->join(', '),
                'price'    => $appointment->price,
            ],
        ]);
    }
}
