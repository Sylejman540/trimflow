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

        $appointment = Appointment::with(['barber.user', 'services', 'customer'])
            ->where('cancel_token', $token)
            ->where('company_id', $company->id)
            ->firstOrFail();

        $customer = $appointment->customer;

        // Get past appointments for this customer
        $past = Appointment::with(['barber.user', 'services'])
            ->where('customer_id', $customer->id)
            ->whereIn('status', ['completed', 'cancelled', 'no_show'])
            ->orderByDesc('starts_at')
            ->limit(10)
            ->get()
            ->map(fn($a) => [
                'id'       => $a->id,
                'starts_at'=> $a->starts_at->toIso8601String(),
                'status'   => $a->status,
                'price'    => $a->price,
                'barber'   => $a->barber?->user?->name ?? '-',
                'service'  => $a->services->pluck('name')->join(', '),
            ]);

        return Inertia::render('booking/portal/Status', [
            'company'     => array_merge(
                $company->only('id', 'name', 'slug', 'phone', 'address', 'city'),
                ['logo' => $company->logo ? asset('storage/' . $company->logo) : null]
            ),
            'appointment' => [
                'status'   => $appointment->status,
                'starts_at'=> $appointment->starts_at->toIso8601String(),
                'barber'   => $appointment->barber?->user?->name,
                'services' => $appointment->services->pluck('name')->join(', '),
                'price'    => $appointment->price,
            ],
            'past'        => $past,
        ]);
    }
}
