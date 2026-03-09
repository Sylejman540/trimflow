<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Barber;
use App\Models\Company;
use App\Models\Customer;
use App\Models\Service;
use App\Models\User;
use App\Notifications\NewPublicBooking;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Inertia\Inertia;

class BookingController extends Controller
{
    public function show(string $slug)
    {
        $company  = Company::where('slug', $slug)->where('is_active', true)->firstOrFail();
        $barbers  = Barber::where('company_id', $company->id)->where('is_active', true)->with('user')->get();
        $services = Service::where('company_id', $company->id)->where('is_active', true)->orderBy('name')->get();

        return Inertia::render('booking/Show', [
            'company'  => $company->only('id', 'name', 'slug', 'address', 'phone'),
            'barbers'  => $barbers->map(fn($b) => [
                'id'        => $b->id,
                'user'      => ['name' => $b->user->name],
                'specialty' => $b->specialty,
            ]),
            'services' => $services->map(fn($s) => [
                'id'          => $s->id,
                'name'        => $s->name,
                'price'       => $s->price,
                'duration'    => $s->duration,
                'category'    => $s->category,
                'description' => $s->description,
                'color'       => $s->color,
            ]),
        ]);
    }

    public function store(Request $request, string $slug)
    {
        $company = Company::where('slug', $slug)->where('is_active', true)->firstOrFail();

        // ── Rate limiting: max 5 attempts per IP per 10 minutes ───────────────
        $rateLimitKey = 'public-booking:' . $request->ip();
        if (RateLimiter::tooManyAttempts($rateLimitKey, 5)) {
            $seconds = RateLimiter::availableIn($rateLimitKey);
            return back()->withErrors([
                'customer_name' => "Too many booking attempts. Please try again in {$seconds} seconds.",
            ]);
        }
        RateLimiter::hit($rateLimitKey, 600);

        // ── Validation ─────────────────────────────────────────────────────────
        $validated = $request->validate([
            'barber_id'      => 'required|exists:barbers,id',
            'service_ids'    => 'required|array|min:1',
            'service_ids.*'  => 'integer|exists:services,id',
            'starts_at'      => 'required|date|after:now',
            'customer_name'  => 'required|string|max:255',
            'customer_phone' => 'required|string|max:50',
            'customer_email' => 'nullable|email|max:255',
            'notes'          => 'nullable|string|max:1000',
        ]);

        // ── Verify barber + service belong to this company ─────────────────────
        $barber   = Barber::where('id', $validated['barber_id'])->where('company_id', $company->id)->firstOrFail();
        $services = Service::whereIn('id', $validated['service_ids'])->where('company_id', $company->id)->get();
        if ($services->count() !== count($validated['service_ids'])) {
            abort(422, 'One or more services not found.');
        }
        $totalDuration = (int) $services->sum('duration');
        $totalPrice    = (int) $services->sum('price');

        $startsAt = Carbon::parse($validated['starts_at']);
        $endsAt   = $startsAt->copy()->addMinutes($totalDuration);

        // ── Working hours check ────────────────────────────────────────────────
        $dayKey   = strtolower($startsAt->format('l'));
        $shortKey = substr($dayKey, 0, 3);
        $hours    = $barber->working_hours;
        $dayHours = $hours[$dayKey] ?? $hours[$shortKey] ?? null;

        if ($dayHours) {
            if (isset($dayHours['enabled'])) {
                if (! $dayHours['enabled']) {
                    return back()->withErrors(['starts_at' => 'The barber does not work on that day.']);
                }
                $windowStart = $dayHours['start'] ?? '09:00';
                $windowEnd   = $dayHours['end']   ?? '17:00';
            } else {
                [$windowStart, $windowEnd] = array_values($dayHours);
            }

            $t = $startsAt->format('H:i');
            if ($t < $windowStart || $t >= $windowEnd) {
                return back()->withErrors(['starts_at' => 'The barber is not available at that time.']);
            }
        }

        // ── Time-off check ─────────────────────────────────────────────────────
        $dateStr   = $startsAt->format('Y-m-d');
        $onTimeOff = DB::table('barber_time_offs')
            ->where('barber_id', $barber->id)
            ->where('starts_on', '<=', $dateStr)
            ->where('ends_on', '>=', $dateStr)
            ->exists();

        if ($onTimeOff) {
            return back()->withErrors(['starts_at' => 'The barber is on time off that day.']);
        }

        // ── Double-booking check ───────────────────────────────────────────────
        $conflict = Appointment::where('barber_id', $barber->id)
            ->whereNotIn('status', ['cancelled', 'no_show'])
            ->where('starts_at', '<', $endsAt)
            ->where('ends_at', '>', $startsAt)
            ->exists();

        if ($conflict) {
            return back()->withErrors(['starts_at' => 'That time slot has just been taken. Please choose another.']);
        }

        // ── Phone trust / reputation check ─────────────────────────────────────
        $existingCustomer = Customer::where('company_id', $company->id)
            ->where('phone', $validated['customer_phone'])
            ->first();

        if ($existingCustomer) {
            if ($existingCustomer->booking_trust === 'blocked') {
                return back()->withErrors([
                    'customer_phone' => 'This phone number has been restricted from making online bookings. Please call us.',
                ]);
            }

            if ($existingCustomer->booking_trust === 'restricted') {
                $pendingCount = Appointment::where('customer_id', $existingCustomer->id)
                    ->whereIn('status', ['scheduled', 'confirmed'])
                    ->where('starts_at', '>', now())
                    ->count();

                if ($pendingCount >= 1) {
                    return back()->withErrors([
                        'customer_phone' => 'Your account requires manual approval due to past no-shows. Please call us.',
                    ]);
                }
            }

            // Duplicate booking protection: max 3 future appointments
            $futureCount = Appointment::where('customer_id', $existingCustomer->id)
                ->whereIn('status', ['scheduled', 'confirmed'])
                ->where('starts_at', '>', now())
                ->count();

            if ($futureCount >= 3) {
                return back()->withErrors([
                    'customer_phone' => 'You already have 3 upcoming appointments. Please call us to book more.',
                ]);
            }
        }

        // ── Create / update customer ───────────────────────────────────────────
        $customer = Customer::firstOrCreate(
            ['phone' => $validated['customer_phone'], 'company_id' => $company->id],
            ['name'  => $validated['customer_name'], 'email' => $validated['customer_email'] ?? null]
        );

        $customer->fill([
            'name'  => $validated['customer_name'],
            'email' => $validated['customer_email'] ?? $customer->email,
        ])->save();

        // ── Create appointment ─────────────────────────────────────────────────
        $cancelToken   = Str::random(48);
        $cancelExpires = now()->addSeconds(60);

        $appointment = Appointment::create([
            'company_id'              => $company->id,
            'barber_id'               => $barber->id,
            'customer_id'             => $customer->id,
            'service_id'              => $services->first()->id,
            'starts_at'               => $startsAt,
            'ends_at'                 => $endsAt,
            'price'                   => $totalPrice,
            'status'                  => 'scheduled',
            'booking_source'          => 'public_booking',
            'notes'                   => $validated['notes'] ?? null,
            'cancel_token'            => $cancelToken,
            'cancel_token_expires_at' => $cancelExpires,
        ]);

        $pivotData = $services->mapWithKeys(fn($s) => [
            $s->id => ['price' => $s->price, 'duration' => $s->duration]
        ])->all();
        $appointment->services()->attach($pivotData);

        $appointment->load(['barber.user', 'customer', 'service']);

        // ── Notify barber and shop owners ──────────────────────────────────────
        if ($barber->user) {
            $barber->user->notify(new NewPublicBooking($appointment));
        }

        User::where('company_id', $company->id)
            ->whereHas('roles', fn($q) => $q->whereIn('name', ['shop-admin', 'platform-admin']))
            ->each(fn(User $u) => $u->notify(new NewPublicBooking($appointment)));

        // Increment booking total for trust tracking
        $customer->increment('booking_total');

        return redirect()->route('booking.confirmation', $slug)
            ->with('cancel_token', $cancelToken)
            ->with('cancel_expires_at', $cancelExpires->toIso8601String());
    }

    public function confirmation(string $slug)
    {
        $company = Company::where('slug', $slug)->where('is_active', true)->firstOrFail();

        return Inertia::render('booking/Confirmation', [
            'company'          => $company->only('id', 'name', 'slug', 'phone'),
            'cancel_token'     => session('cancel_token'),
            'cancel_expires_at'=> session('cancel_expires_at'),
        ]);
    }
}
