<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Barber;
use App\Models\Customer;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AppointmentController extends Controller
{
    public function index()
    {
        $this->authorize('viewAny', Appointment::class);

        $query = Appointment::with(['barber.user', 'customer', 'service'])
            ->orderBy('starts_at', 'desc');

        $user = Auth::user();
        if ($user->hasRole('barber') && !$user->hasRole('shop-admin')) {
            $query->where('barber_id', $user->barber?->id);
        }

        return Inertia::render('appointments/Index', [
            'appointments' => $query->get(),
            'can_create' => $user->can('create', Appointment::class),
        ]);
    }

    public function create()
    {
        $this->authorize('create', Appointment::class);

        return Inertia::render('appointments/Create', [
            'barbers' => Barber::with('user')->where('is_active', true)->get(),
            'services' => Service::where('is_active', true)->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('create', Appointment::class);

        $user = Auth::user();
        $isBarber = $user->hasRole('barber') && !$user->hasRole('shop-admin');

        $validated = $request->validate([
            'barber_id' => $isBarber ? 'nullable' : 'required|exists:barbers,id',
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'nullable|string|max:50',
            'service_id' => 'required|exists:services,id',
            'starts_at' => 'required|date',
            'notes' => 'nullable|string|max:1000',
        ]);

        $barberId = $isBarber ? $user->barber?->id : $validated['barber_id'];

        $customer = Customer::firstOrCreate(
            ['name' => $validated['customer_name'], 'company_id' => $user->company_id],
            ['phone' => $validated['customer_phone']],
        );

        if ($validated['customer_phone'] && $customer->phone !== $validated['customer_phone']) {
            $customer->update(['phone' => $validated['customer_phone']]);
        }

        $service = Service::findOrFail($validated['service_id']);
        $startsAt = Carbon::parse($validated['starts_at']);

        Appointment::create([
            'barber_id' => $barberId,
            'customer_id' => $customer->id,
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
        $this->authorize('view', $appointment);

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
        $this->authorize('update', $appointment);

        $appointment->load(['barber.user', 'customer', 'service']);

        return Inertia::render('appointments/Edit', [
            'appointment' => $appointment,
            'barbers' => Barber::with('user')->where('is_active', true)->get(),
            'services' => Service::where('is_active', true)->orderBy('name')->get(),
        ]);
    }

    public function update(Request $request, Appointment $appointment)
    {
        $this->authorize('update', $appointment);

        $user = Auth::user();

        $validated = $request->validate([
            'barber_id' => 'required|exists:barbers,id',
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'nullable|string|max:50',
            'service_id' => 'required|exists:services,id',
            'starts_at' => 'required|date',
            'status' => 'required|in:scheduled,confirmed,in_progress,completed,cancelled,no_show',
            'notes' => 'nullable|string|max:1000',
        ]);

        $customer = Customer::firstOrCreate(
            ['name' => $validated['customer_name'], 'company_id' => $user->company_id],
            ['phone' => $validated['customer_phone']],
        );

        if ($validated['customer_phone'] && $customer->phone !== $validated['customer_phone']) {
            $customer->update(['phone' => $validated['customer_phone']]);
        }

        $service = Service::findOrFail($validated['service_id']);
        $startsAt = Carbon::parse($validated['starts_at']);

        $appointment->update([
            'barber_id' => $validated['barber_id'],
            'customer_id' => $customer->id,
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
        $this->authorize('delete', $appointment);

        $appointment->delete();

        return redirect()->route('appointments.index')->with('success', 'Appointment deleted.');
    }
}
