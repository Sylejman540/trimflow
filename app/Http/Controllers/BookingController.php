<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Barber;
use App\Models\Company;
use App\Models\Customer;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class BookingController extends Controller
{
    public function show(string $slug)
    {
        $company = Company::where('slug', $slug)->where('is_active', true)->firstOrFail();

        $barbers  = Barber::where('company_id', $company->id)->where('is_active', true)->with('user')->get();
        $services = Service::where('company_id', $company->id)->where('is_active', true)->orderBy('name')->get();

        return Inertia::render('booking/Show', [
            'company'  => $company,
            'barbers'  => $barbers,
            'services' => $services,
        ]);
    }

    public function store(Request $request, string $slug)
    {
        $company = Company::where('slug', $slug)->where('is_active', true)->firstOrFail();

        $validated = $request->validate([
            'barber_id'     => 'required|exists:barbers,id',
            'service_id'    => 'required|exists:services,id',
            'starts_at'     => 'required|date|after:now',
            'customer_name' => 'required|string|max:255',
            'customer_email'=> 'nullable|email|max:255',
            'customer_phone'=> 'nullable|string|max:50',
            'notes'         => 'nullable|string|max:1000',
        ]);

        // Ensure barber + service belong to this company
        $barber  = Barber::where('id', $validated['barber_id'])->where('company_id', $company->id)->firstOrFail();
        $service = Service::where('id', $validated['service_id'])->where('company_id', $company->id)->firstOrFail();

        $startsAt = Carbon::parse($validated['starts_at']);

        // Block outside working hours if configured
        $dayKey   = strtolower($startsAt->format('l'));
        $dayHours = $barber->working_hours[$dayKey] ?? null;
        if ($dayHours && !empty($dayHours['enabled'])) {
            $t = $startsAt->format('H:i');
            if ($t < $dayHours['start'] || $t >= $dayHours['end']) {
                return back()->withErrors(['starts_at' => "The barber is not available at that time."]);
            }
        }

        $customer = Customer::firstOrCreate(
            ['name' => $validated['customer_name'], 'company_id' => $company->id],
            ['email' => $validated['customer_email'], 'phone' => $validated['customer_phone']],
        );

        Appointment::create([
            'company_id'  => $company->id,
            'barber_id'   => $barber->id,
            'customer_id' => $customer->id,
            'service_id'  => $service->id,
            'starts_at'   => $startsAt,
            'ends_at'     => $startsAt->copy()->addMinutes($service->duration),
            'price'       => $service->price,
            'status'      => 'scheduled',
            'notes'       => $validated['notes'] ?? null,
        ]);

        return redirect()->route('booking.confirmation', $slug);
    }

    public function confirmation(string $slug)
    {
        $company = Company::where('slug', $slug)->where('is_active', true)->firstOrFail();

        return Inertia::render('booking/Confirmation', [
            'company' => $company,
        ]);
    }
}
