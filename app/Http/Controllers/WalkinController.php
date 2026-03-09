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
            'barber_id'     => $isBarber ? 'nullable' : 'required|exists:barbers,id',
        ]);

        $barberId = $isBarber ? $user->barber?->id : $validated['barber_id'];

        $customer = Customer::firstOrCreate(
            ['name' => $validated['customer_name'], 'company_id' => $user->company_id],
        );

        $service  = Service::findOrFail($validated['service_id']);
        $startsAt = Carbon::now();
        $endsAt   = $startsAt->copy()->addMinutes($service->duration);

        // Check for conflicts
        if ($barberId) {
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
}
