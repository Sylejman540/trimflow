<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Barber;
use App\Models\Customer;
use App\Models\Service;
use App\Models\BarberTimeOff;
use App\Models\WaitlistEntry;
use App\Notifications\AppointmentStatusChanged;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
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

        $appointments = $query->get()->map(function (Appointment $appt) use ($user) {
            $data = $appt->toArray();
            $data['can_edit'] = $user->can('update', $appt);
            $data['can_delete'] = $user->can('delete', $appt);
            return $data;
        });

        return Inertia::render('appointments/Index', [
            'appointments' => $appointments,
            'can_create' => $user->can('create', Appointment::class),
            'barbers' => Barber::with('user')->where('is_active', true)->get(),
            'services' => Service::where('is_active', true)->orderBy('name')->get(),
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
            'barber_id'       => $isBarber ? 'nullable' : 'required|exists:barbers,id',
            'customer_name'   => 'required|string|max:255',
            'customer_phone'  => 'nullable|string|max:50',
            'service_id'      => 'required|exists:services,id',
            'starts_at'       => 'required|date',
            'notes'           => 'nullable|string|max:1000',
            'recurrence_rule' => 'nullable|in:none,weekly,biweekly,monthly',
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

        $this->validateBarberAvailability($barberId, $startsAt);
        $endsAt = $startsAt->copy()->addMinutes($service->duration);
        $this->validateNoConflict($barberId, $startsAt, $endsAt);

        Appointment::create([
            'barber_id'       => $barberId,
            'customer_id'     => $customer->id,
            'service_id'      => $validated['service_id'],
            'starts_at'       => $startsAt,
            'ends_at'         => $endsAt,
            'price'           => $service->price,
            'status'          => 'scheduled',
            'notes'           => $validated['notes'] ?? null,
            'recurrence_rule' => $validated['recurrence_rule'] ?? 'none',
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

        $user = Auth::user();

        return Inertia::render('appointments/Show', [
            'appointment' => $appointment,
            'can_edit' => $user->can('update', $appointment),
            'can_delete' => $user->can('delete', $appointment),
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
            'barber_id'       => 'required|exists:barbers,id',
            'customer_name'   => 'required|string|max:255',
            'customer_phone'  => 'nullable|string|max:50',
            'service_id'      => 'required|exists:services,id',
            'starts_at'       => 'required|date',
            'status'          => 'required|in:scheduled,confirmed,in_progress,completed,cancelled,no_show',
            'notes'           => 'nullable|string|max:1000',
            'recurrence_rule' => 'nullable|in:none,weekly,biweekly,monthly',
            'tip_amount'      => 'nullable|numeric|min:0',
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

        $this->validateBarberAvailability($validated['barber_id'], $startsAt);
        $endsAt = $startsAt->copy()->addMinutes($service->duration);
        $this->validateNoConflict($validated['barber_id'], $startsAt, $endsAt, $appointment->id);

        $previousStatus = $appointment->status;

        $appointment->update([
            'barber_id'       => $validated['barber_id'],
            'customer_id'     => $customer->id,
            'service_id'      => $validated['service_id'],
            'starts_at'       => $startsAt,
            'ends_at'         => $endsAt,
            'price'           => $service->price,
            'tip_amount'      => (int) round(($validated['tip_amount'] ?? 0) * 100),
            'status'          => $validated['status'],
            'notes'           => $validated['notes'] ?? null,
            'recurrence_rule' => $validated['recurrence_rule'] ?? $appointment->recurrence_rule,
        ]);

        // Award loyalty points when first marked completed (1 point per $1 of service price)
        if ($previousStatus !== 'completed' && $validated['status'] === 'completed') {
            $points = max(1, (int) round($service->price / 100));
            $customer->increment('loyalty_points', $points);
            $customer->update(['last_visit_at' => $startsAt]);
        }

        // Notify waiting waitlist entries when an appointment slot opens (cancelled)
        if ($previousStatus !== 'cancelled' && $validated['status'] === 'cancelled') {
            WaitlistEntry::where('status', 'waiting')
                ->where(fn ($q) => $q->whereNull('barber_id')->orWhere('barber_id', $appointment->barber_id))
                ->where(fn ($q) => $q->whereNull('service_id')->orWhere('service_id', $appointment->service_id))
                ->take(5)
                ->each(function (WaitlistEntry $entry) {
                    $entry->update(['status' => 'notified', 'notified_at' => now()]);
                    // Optionally send email notification here
                });
        }

        // Notify the shop admin when status changes
        if ($previousStatus !== $validated['status']) {
            $appointment->load(['customer', 'service']);
            $owner = \App\Models\User::where('company_id', $user->company_id)
                ->role('shop-admin')
                ->first();
            if ($owner && $owner->id !== $user->id) {
                $owner->notify(new AppointmentStatusChanged($appointment, $previousStatus));
            }
        }

        return redirect()->route('appointments.index')->with('success', 'Appointment updated.');
    }

    private function validateBarberAvailability(?int $barberId, Carbon $startsAt): void
    {
        if (! $barberId) return;

        $barber = Barber::find($barberId);
        if (! $barber || empty($barber->working_hours)) return;

        $dayKey   = strtolower($startsAt->format('l')); // e.g. "monday"
        $dayHours = $barber->working_hours[$dayKey] ?? null;

        if (! $dayHours || empty($dayHours['enabled'])) {
            throw ValidationException::withMessages([
                'starts_at' => 'The barber is not working on ' . ucfirst($dayKey) . '.',
            ]);
        }

        $appointmentTime = $startsAt->format('H:i');
        if ($appointmentTime < $dayHours['start'] || $appointmentTime >= $dayHours['end']) {
            throw ValidationException::withMessages([
                'starts_at' => "The barber works {$dayHours['start']}–{$dayHours['end']} on " . ucfirst($dayKey) . '.',
            ]);
        }

        // Check time off / vacation blocks
        $onTimeOff = BarberTimeOff::where('barber_id', $barberId)
            ->where('starts_on', '<=', $startsAt->toDateString())
            ->where('ends_on', '>=', $startsAt->toDateString())
            ->first();

        if ($onTimeOff) {
            $label = $onTimeOff->reason ? " ({$onTimeOff->reason})" : '';
            throw ValidationException::withMessages([
                'starts_at' => "The barber is on time off from {$onTimeOff->starts_on->format('M j')} to {$onTimeOff->ends_on->format('M j')}{$label}.",
            ]);
        }
    }

    private function validateNoConflict(?int $barberId, Carbon $startsAt, Carbon $endsAt, ?int $excludeId = null): void
    {
        if (! $barberId) return;

        $conflict = Appointment::where('barber_id', $barberId)
            ->whereNotIn('status', ['cancelled', 'no_show'])
            ->when($excludeId, fn ($q) => $q->where('id', '!=', $excludeId))
            ->where(fn ($q) => $q
                ->whereBetween('starts_at', [$startsAt, $endsAt->copy()->subSecond()])
                ->orWhereBetween('ends_at', [$startsAt->copy()->addSecond(), $endsAt])
                ->orWhere(fn ($q2) => $q2->where('starts_at', '<=', $startsAt)->where('ends_at', '>=', $endsAt))
            )
            ->first();

        if ($conflict) {
            throw ValidationException::withMessages([
                'starts_at' => 'This barber already has an appointment from '
                    . Carbon::parse($conflict->starts_at)->format('g:i A')
                    . ' to '
                    . Carbon::parse($conflict->ends_at)->format('g:i A')
                    . '. Please choose a different time.',
            ]);
        }
    }

    public function destroy(Appointment $appointment)
    {
        $this->authorize('delete', $appointment);

        $appointment->delete();

        return redirect()->route('appointments.index')->with('success', 'Appointment deleted.');
    }
}
