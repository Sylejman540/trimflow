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
            ->where('ends_at', '>=', Carbon::now())
            ->orderBy('starts_at', 'asc');

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
        $phone = $validated['customer_phone'] ?? null;

        $customer = Customer::firstOrCreate(
            ['name' => $validated['customer_name'], 'company_id' => $user->company_id],
            ['phone' => $phone],
        );

        if ($phone && $customer->phone !== $phone) {
            $customer->update(['phone' => $phone]);
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
            'status'          => 'confirmed',
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
            'products',
        ]);

        $user = Auth::user();

        return Inertia::render('appointments/Show', [
            'appointment'  => $appointment,
            'can_edit'     => $user->can('update', $appointment),
            'can_delete'   => $user->can('delete', $appointment),
            'all_products' => \App\Models\Product::where('is_active', true)->orderBy('name')->get(['id', 'name', 'price', 'stock_qty']),
        ]);
    }

    public function edit(Appointment $appointment)
    {
        $this->authorize('update', $appointment);

        $appointment->load(['barber.user', 'customer', 'service']);

        $user = Auth::user();
        $isBarber = $user->hasRole('barber') && ! $user->hasRole('shop-admin');

        return Inertia::render('appointments/Edit', [
            'appointment' => $appointment,
            'barbers' => $isBarber ? [] : Barber::with('user')->where('is_active', true)->get(),
            'services' => Service::where('is_active', true)->orderBy('name')->get(),
            'is_barber' => $isBarber,
        ]);
    }

    public function update(Request $request, Appointment $appointment)
    {
        $this->authorize('update', $appointment);

        $user = Auth::user();
        $isBarber = $user->hasRole('barber') && ! $user->hasRole('shop-admin');

        $validated = $request->validate([
            'barber_id'       => $isBarber ? 'nullable' : 'required|exists:barbers,id',
            'customer_name'   => 'required|string|max:255',
            'customer_phone'  => 'nullable|string|max:50',
            'service_id'      => 'required|exists:services,id',
            'starts_at'       => 'required|date',
            'status'          => 'required|in:confirmed,in_progress,completed,cancelled,no_show',
            'notes'           => 'nullable|string|max:1000',
            'recurrence_rule' => 'nullable|in:none,weekly,biweekly,monthly',
            'tip_amount'      => 'nullable|numeric|min:0',
        ]);

        $phone = $validated['customer_phone'] ?? null;
        $barberId = $isBarber ? $appointment->barber_id : $validated['barber_id'];

        $customer = Customer::firstOrCreate(
            ['name' => $validated['customer_name'], 'company_id' => $user->company_id],
            ['phone' => $phone],
        );

        if ($phone && $customer->phone !== $phone) {
            $customer->update(['phone' => $phone]);
        }

        $service = Service::findOrFail($validated['service_id']);
        $startsAt = Carbon::parse($validated['starts_at']);

        $this->validateBarberAvailability($barberId, $startsAt);
        $endsAt = $startsAt->copy()->addMinutes($service->duration);
        $this->validateNoConflict($barberId, $startsAt, $endsAt, $appointment->id);

        $previousStatus = $appointment->status;

        $appointment->update([
            'barber_id'       => $barberId,
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

        // Phone trust: track no-shows and auto-escalate trust level
        if ($previousStatus !== 'no_show' && $validated['status'] === 'no_show') {
            $customer->increment('booking_no_shows');
            $customer->refresh();
            if ($customer->booking_no_shows >= 4 && $customer->booking_trust !== 'blocked') {
                $customer->update(['booking_trust' => 'blocked']);
            } elseif ($customer->booking_no_shows >= 2 && $customer->booking_trust === 'ok') {
                $customer->update(['booking_trust' => 'restricted']);
            }
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
        $shortKey = substr($dayKey, 0, 3);              // e.g. "mon" (seeder format)
        $dayHours = $barber->working_hours[$dayKey] ?? $barber->working_hours[$shortKey] ?? null;

        // Support two formats:
        // Schedule editor: ['enabled' => true, 'start' => '09:00', 'end' => '17:00']
        // Seeder legacy:   ['09:00', '17:00']  (numeric array, index 0=start, 1=end)
        if (! $dayHours) {
            throw ValidationException::withMessages([
                'starts_at' => 'The barber is not working on ' . ucfirst($dayKey) . '.',
            ]);
        }

        if (isset($dayHours['enabled'])) {
            // Schedule editor format
            if (! $dayHours['enabled']) {
                throw ValidationException::withMessages([
                    'starts_at' => 'The barber is not working on ' . ucfirst($dayKey) . '.',
                ]);
            }
            $startTime = $dayHours['start'];
            $endTime   = $dayHours['end'];
        } else {
            // Legacy seeder format: [0 => '09:00', 1 => '17:00']
            $startTime = $dayHours[0] ?? null;
            $endTime   = $dayHours[1] ?? null;
            if (! $startTime || ! $endTime) {
                throw ValidationException::withMessages([
                    'starts_at' => 'The barber is not working on ' . ucfirst($dayKey) . '.',
                ]);
            }
        }

        $appointmentTime = $startsAt->format('H:i');
        if ($appointmentTime < $startTime || $appointmentTime >= $endTime) {
            throw ValidationException::withMessages([
                'starts_at' => "The barber works {$startTime}–{$endTime} on " . ucfirst($dayKey) . '.',
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
