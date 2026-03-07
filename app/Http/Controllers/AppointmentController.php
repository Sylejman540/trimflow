<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Barber;
use App\Models\Customer;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class AppointmentController extends Controller
{
    public function index()
    {
        $appointments = Appointment::with(['barber.user', 'customer', 'service'])
            ->orderBy('starts_at', 'desc')
            ->get();

        return Inertia::render('appointments/Index', [
            'appointments' => $appointments,
        ]);
    }

    public function create()
    {
        return Inertia::render('appointments/Create', [
            'barbers' => Barber::with('user')->where('is_active', true)->get(),
            'customers' => Customer::orderBy('name')->get(),
            'services' => Service::where('is_active', true)->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'barber_id' => 'required|exists:barbers,id',
            'customer_id' => 'required|exists:customers,id',
            'service_id' => 'required|exists:services,id',
            'starts_at' => 'required|date',
            'notes' => 'nullable|string|max:1000',
        ]);

        $service = Service::findOrFail($validated['service_id']);
        $startsAt = Carbon::parse($validated['starts_at']);

        Appointment::create([
            'barber_id' => $validated['barber_id'],
            'customer_id' => $validated['customer_id'],
            'service_id' => $validated['service_id'],
            'starts_at' => $startsAt,
            'ends_at' => $startsAt->copy()->addMinutes($service->duration),
            'price' => $service->price,
            'status' => 'scheduled',
            'notes' => $validated['notes'] ?? null,
        ]);

        return redirect()->route('appointments.index')->with('success', 'Appointment created.');
    }

    public function show(Appointment $appointment)
    {
        $appointment->load([
            'barber.user',
            'customer',
            'service',
            'payment',
            'review.customer',
            'barberNotes',
        ]);

        return Inertia::render('appointments/Show', [
            'appointment' => $appointment,
        ]);
    }

    public function edit(Appointment $appointment)
    {
        $appointment->load(['barber.user', 'customer', 'service']);

        return Inertia::render('appointments/Edit', [
            'appointment' => $appointment,
            'barbers' => Barber::with('user')->where('is_active', true)->get(),
            'customers' => Customer::orderBy('name')->get(),
            'services' => Service::where('is_active', true)->orderBy('name')->get(),
        ]);
    }

    public function update(Request $request, Appointment $appointment)
    {
        $validated = $request->validate([
            'barber_id' => 'required|exists:barbers,id',
            'customer_id' => 'required|exists:customers,id',
            'service_id' => 'required|exists:services,id',
            'starts_at' => 'required|date',
            'status' => 'required|in:scheduled,confirmed,in_progress,completed,cancelled,no_show',
            'notes' => 'nullable|string|max:1000',
        ]);

        $service = Service::findOrFail($validated['service_id']);
        $startsAt = Carbon::parse($validated['starts_at']);

        $appointment->update([
            'barber_id' => $validated['barber_id'],
            'customer_id' => $validated['customer_id'],
            'service_id' => $validated['service_id'],
            'starts_at' => $startsAt,
            'ends_at' => $startsAt->copy()->addMinutes($service->duration),
            'price' => $service->price,
            'status' => $validated['status'],
            'notes' => $validated['notes'] ?? null,
        ]);

        return redirect()->route('appointments.index')->with('success', 'Appointment updated.');
    }

    public function destroy(Appointment $appointment)
    {
        $appointment->delete();

        return redirect()->route('appointments.index')->with('success', 'Appointment deleted.');
    }
}
