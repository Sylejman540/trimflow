<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Company;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Inertia\Inertia;

class CustomerPortalController extends Controller
{
    public function show(string $slug)
    {
        $company = Company::where('slug', $slug)->where('is_active', true)->firstOrFail();

        return Inertia::render('booking/portal/Show', [
            'company' => $company->only('id', 'name', 'slug', 'phone'),
        ]);
    }

    public function lookup(Request $request, string $slug)
    {
        $company = Company::where('slug', $slug)->where('is_active', true)->firstOrFail();

        // Rate limit: 5 attempts per IP per 10 minutes
        $key = 'portal-lookup:' . $request->ip();
        if (RateLimiter::tooManyAttempts($key, 5)) {
            $seconds = RateLimiter::availableIn($key);
            return back()->withErrors(['phone' => trans('booking.errorTooManyAttemptsPortal', ['seconds' => $seconds])]);
        }
        RateLimiter::hit($key, 600);

        $request->validate(['phone' => 'required|string|max:50']);

        $phone = $request->input('phone');

        $customer = Customer::where('company_id', $company->id)
            ->where('phone', $phone)
            ->first();

        if (!$customer) {
            return back()->withErrors(['phone' => trans('booking.errorPhoneNotFound')]);
        }

        $upcoming = Appointment::with(['barber.user', 'service'])
            ->where('customer_id', $customer->id)
            ->whereIn('status', ['pending', 'confirmed', 'in_progress'])
            ->where('starts_at', '>', now())
            ->orderBy('starts_at')
            ->get()
            ->map(fn ($a) => $this->mapAppointment($a));

        $past = Appointment::with(['barber.user', 'service'])
            ->where('customer_id', $customer->id)
            ->whereIn('status', ['completed', 'cancelled', 'no_show'])
            ->orderByDesc('starts_at')
            ->limit(20)
            ->get()
            ->map(fn ($a) => $this->mapAppointment($a));

        return Inertia::render('booking/portal/Appointments', [
            'company'   => $company->only('id', 'name', 'slug', 'phone', 'address', 'city'),
            'customer'  => ['name' => $customer->name, 'phone' => $customer->phone],
            'upcoming'  => $upcoming,
            'past'      => $past,
        ]);
    }

    public function cancel(Request $request, string $slug)
    {
        $company = Company::where('slug', $slug)->where('is_active', true)->firstOrFail();

        $request->validate([
            'appointment_id' => 'required|integer',
            'phone'          => 'required|string',
        ]);

        $customer = Customer::where('company_id', $company->id)
            ->where('phone', $request->phone)
            ->firstOrFail();

        $appointment = Appointment::where('id', $request->appointment_id)
            ->where('customer_id', $customer->id)
            ->whereIn('status', ['pending', 'confirmed'])
            ->where('starts_at', '>', now())
            ->firstOrFail();

        $appointment->update(['status' => 'cancelled']);

        return redirect()->route('portal.lookup', $slug)
            ->withInput(['phone' => $request->phone])
            ->with('success', trans('booking.appointmentCancelled'));
    }

    private function mapAppointment(Appointment $a): array
    {
        return [
            'id'         => $a->id,
            'starts_at'  => $a->starts_at->toIso8601String(),
            'ends_at'    => $a->ends_at->toIso8601String(),
            'status'     => $a->status,
            'price'      => $a->price,
            'barber'     => $a->barber?->user?->name ?? '-',
            'service'    => $a->service?->name ?? '-',
        ];
    }
}
