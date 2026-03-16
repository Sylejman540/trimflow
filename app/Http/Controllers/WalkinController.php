<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Barber;
use App\Models\Customer;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class WalkinController extends Controller
{
    public function store(Request $request)
    {
        $this->authorize('create', Appointment::class);

        $user = Auth::user();
        $isBarber = $user->hasRole('barber') && !$user->hasRole('shop-admin');

        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'service_id'    => 'required|exists:services,id',
            'barber_id'     => 'nullable|exists:barbers,id',
        ]);

        if ($isBarber) {
            $barberId = $user->barber?->id;
            if (! $barberId) {
                throw ValidationException::withMessages(['barber_id' => 'Your barber profile is not set up yet.']);
            }
        } else {
            $barberId = $validated['barber_id'] ?? null;
            if (! $barberId) {
                throw ValidationException::withMessages(['barber_id' => 'Please select a barber.']);
            }
            // Ensure the selected barber belongs to this company
            $barberExists = Barber::where('id', $barberId)
                ->where('company_id', $user->company_id)
                ->exists();
            if (! $barberExists) {
                throw ValidationException::withMessages(['barber_id' => 'Invalid barber selected.']);
            }
        }

        $customer = Customer::firstOrCreate(
            ['name' => $validated['customer_name'], 'company_id' => $user->company_id],
        );

        $service = Service::where('id', $validated['service_id'])
            ->where('company_id', $user->company_id)
            ->where('is_active', true)
            ->firstOrFail();
        $startsAt = Carbon::now();
        $endsAt   = $startsAt->copy()->addMinutes($service->duration);

        // Check for conflicts with pessimistic locking (prevent race conditions)
        if ($barberId) {
            // Lock the barber row to prevent concurrent bookings in the same time slot
            $barber = Barber::lockForUpdate()->find($barberId);

            $conflict = Appointment::where('barber_id', $barberId)
                ->whereNotIn('status', ['cancelled', 'no_show'])
                ->where(fn ($q) => $q
                    ->whereBetween('starts_at', [$startsAt, $endsAt->copy()->subSecond()])
                    ->orWhereBetween('ends_at', [$startsAt->copy()->addSecond(), $endsAt])
                    ->orWhere(fn ($q2) => $q2->where('starts_at', '<=', $startsAt)->where('ends_at', '>=', $endsAt))
                )
                ->first();

            if ($conflict) {
                throw ValidationException::withMessages([
                    'barber_id' => 'This barber is currently busy until '
                        . Carbon::parse($conflict->ends_at)->format('g:i A') . '.',
                ]);
            }
        }

        Appointment::create([
            'barber_id'       => $barberId,
            'customer_id'     => $customer->id,
            'service_id'      => $service->id,
            'starts_at'       => $startsAt,
            'ends_at'         => $endsAt,
            'price'           => $service->price,
            'status'          => 'in_progress',
            'notes'           => 'Walk-in',
            'recurrence_rule' => 'none',
        ]);

        return back()->with('success', 'Walk-in booked for ' . $customer->name . '.');
    }

    public function availability(Request $request)
    {
        $user = Auth::user();
        $serviceId = $request->query('service_id');

        // Get service
        $service = Service::where('id', $serviceId)
            ->where('company_id', $user->company_id)
            ->where('is_active', true)
            ->firstOrFail();

        // Get all active barbers for this company
        $barbers = Barber::where('company_id', $user->company_id)
            ->where('is_active', true)
            ->get();

        $now = Carbon::now();
        $today = $now->format('Y-m-d');
        $appointmentEnd = $now->copy()->addMinutes($service->duration);

        // Filter for available barbers (no conflicts and not on time off)
        $availableBarberIds = $barbers->filter(function ($barber) use ($now, $appointmentEnd, $today) {
            // Check for appointment conflicts
            $conflict = Appointment::where('barber_id', $barber->id)
                ->whereNotIn('status', ['cancelled', 'no_show'])
                ->where(fn ($q) => $q
                    ->whereBetween('starts_at', [$now, $appointmentEnd->copy()->subSecond()])
                    ->orWhereBetween('ends_at', [$now->copy()->addSecond(), $appointmentEnd])
                    ->orWhere(fn ($q2) => $q2->where('starts_at', '<=', $now)->where('ends_at', '>=', $appointmentEnd))
                )
                ->exists();

            if ($conflict) {
                return false;
            }

            // Check for time off on today
            $onTimeOff = \DB::table('barber_time_offs')
                ->where('barber_id', $barber->id)
                ->where('starts_on', '<=', $today)
                ->where('ends_on', '>=', $today)
                ->exists();

            return !$onTimeOff;
        })->pluck('id')->values()->toArray();

        return response()->json(['barbers' => $availableBarberIds]);
    }
}
