<?php

namespace App\Http\Controllers;

use App\Events\AppointmentChanged;
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
use Illuminate\Support\Facades\Http;
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
            'company'            => array_merge(
                $company->only('id', 'name', 'slug', 'address', 'phone'),
                ['logo' => $company->logo ? asset('storage/' . $company->logo) : null]
            ),
            'turnstile_site_key' => config('services.turnstile.site_key'),
            'barbers'            => $barbers->map(fn($b) => [
                'id'        => $b->id,
                'user'      => ['name' => $b->user->name],
                'specialty' => $b->specialty,
            ]),
            'services'           => $services->map(fn($s) => [
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

        // ── 1. Honeypot ────────────────────────────────────────────────────────
        if ($request->filled('_hp')) {
            return redirect()->route('booking.confirmation', $slug);
        }

        // ── 2. Timing check (bot submitted too fast) ───────────────────────────
        $openedAt = (int) $request->input('_t', 0);
        if ($openedAt > 0 && (time() - $openedAt) < 4) {
            return redirect()->route('booking.confirmation', $slug);
        }

        // ── 3. IP rate limiting: max 5 requests per minute ────────────────────
        $ipKey = 'booking-ip:' . $request->ip();
        if (RateLimiter::tooManyAttempts($ipKey, 5)) {
            $seconds = RateLimiter::availableIn($ipKey);
            return back()->withErrors([
                'customer_name' => trans('booking.errorTooManyRequests', ['seconds' => $seconds]),
            ]);
        }
        RateLimiter::hit($ipKey, 60);

        // ── 4. Cloudflare Turnstile verification ──────────────────────────────
        $turnstileSecret = config('services.turnstile.secret_key');
        if ($turnstileSecret) {
            if (! $this->verifyTurnstile($request->input('cf_turnstile_response', ''), $request->ip(), $turnstileSecret)) {
                return back()->withErrors([
                    'customer_name' => trans('booking.errorSecurityCheck'),
                ]);
            }
        }

        // ── 5. Basic validation ────────────────────────────────────────────────
        $validated = $request->validate([
            'barber_id'             => 'required|exists:barbers,id',
            'service_ids'           => 'required|array|min:1',
            'service_ids.*'         => 'integer|exists:services,id',
            'starts_at'             => 'required|date|after:now|before:' . now()->addDays(60)->toDateTimeString(),
            'customer_name'         => 'required|string|max:255',
            'customer_phone'        => 'required|string|min:6|max:30',
            'notes'                 => 'nullable|string|max:1000',
            '_t'                    => 'nullable|integer',
            'cf_turnstile_response' => 'nullable|string',
        ]);

        // Normalize phone: keep only digits and leading +
        $phone = preg_replace('/[^\d+]/', '', $validated['customer_phone']);

        // ── 6. Max 2 bookings per phone per day ───────────────────────────────
        $phoneKey    = 'booking-phone-day:' . md5($phone);
        $phoneWindow = (int) Carbon::now()->endOfDay()->diffInSeconds(Carbon::now());
        if (RateLimiter::tooManyAttempts($phoneKey, 2)) {
            return back()->withErrors([
                'customer_phone' => trans('booking.errorMaxBookingsToday'),
            ]);
        }

        // ── 7. Booking cooldown: 2 minutes between bookings ───────────────────
        $cooldownKey = 'booking-cooldown:' . md5($phone);
        if (RateLimiter::tooManyAttempts($cooldownKey, 1)) {
            $wait = RateLimiter::availableIn($cooldownKey);
            return back()->withErrors([
                'customer_phone' => trans('booking.errorCooldown', ['wait' => $wait]),
            ]);
        }

        // ── 8. Fingerprint tracking + suspicious activity block ───────────────
        $ip          = $request->ip();
        $userAgent   = substr($request->userAgent() ?? '', 0, 512);
        $fingerprint = DB::table('booking_fingerprints')
            ->where('phone', $phone)
            ->where('ip_address', $ip)
            ->first();

        if ($fingerprint) {
            if ($fingerprint->is_blocked) {
                return back()->withErrors([
                    'customer_name' => trans('booking.errorRestricted'),
                ]);
            }
            // Auto-block after 5 bookings from same phone+IP combination
            if ($fingerprint->booking_count >= 5) {
                DB::table('booking_fingerprints')
                    ->where('id', $fingerprint->id)
                    ->update(['is_blocked' => true]);
                return back()->withErrors([
                    'customer_name' => trans('booking.errorSuspicious'),
                ]);
            }
        }

        // ── 9. Verify barber + services belong to this company ─────────────────
        $barber = Barber::where('id', $validated['barber_id'])->where('company_id', $company->id)->firstOrFail();

        $services = Service::whereIn('id', $validated['service_ids'])->where('company_id', $company->id)->get();
        if ($services->count() !== count($validated['service_ids'])) {
            abort(422, 'One or more services not found.');
        }
        $totalDuration = (int) $services->sum('duration');
        $totalPrice    = (int) $services->sum('price');

        $startsAt = Carbon::parse($validated['starts_at']);
        $endsAt   = $startsAt->copy()->addMinutes($totalDuration);

        // ── 10. Working hours check ────────────────────────────────────────────
        $dayKey   = strtolower($startsAt->format('l'));
        $shortKey = substr($dayKey, 0, 3);
        $hours    = $barber->working_hours;
        $dayHours = $hours[$dayKey] ?? $hours[$shortKey] ?? null;

        if ($dayHours) {
            if (isset($dayHours['enabled'])) {
                if (! $dayHours['enabled']) {
                    return back()->withErrors(['starts_at' => trans('booking.errorBarberNotWorking')]);
                }
                $windowStart = $dayHours['start'] ?? '09:00';
                $windowEnd   = $dayHours['end']   ?? '17:00';
            } else {
                [$windowStart, $windowEnd] = array_values($dayHours);
            }
            $t = $startsAt->format('H:i');
            if ($t < $windowStart || $t >= $windowEnd) {
                return back()->withErrors(['starts_at' => trans('booking.errorBarberUnavailable')]);
            }
        }

        // ── 11. Time-off check ─────────────────────────────────────────────────
        $dateStr   = $startsAt->format('Y-m-d');
        $onTimeOff = DB::table('barber_time_offs')
            ->where('barber_id', $barber->id)
            ->where('starts_on', '<=', $dateStr)
            ->where('ends_on', '>=', $dateStr)
            ->exists();
        if ($onTimeOff) {
            return back()->withErrors(['starts_at' => trans('booking.errorTimeOff')]);
        }

        // ── 12. Double-booking check ───────────────────────────────────────────
        $conflict = Appointment::where('barber_id', $barber->id)
            ->whereNotIn('status', ['cancelled', 'no_show'])
            ->where('starts_at', '<', $endsAt)
            ->where('ends_at', '>', $startsAt)
            ->exists();
        if ($conflict) {
            return back()->withErrors(['starts_at' => trans('booking.errorSlotTaken')]);
        }

        // ── 13. Phone trust + active appointment rules ─────────────────────────
        $existingCustomer = Customer::where('company_id', $company->id)
            ->where('phone', $phone)
            ->first();

        if ($existingCustomer) {
            if ($existingCustomer->booking_trust === 'blocked') {
                return back()->withErrors([
                    'customer_phone' => trans('booking.errorBlocked'),
                ]);
            }

            if ($existingCustomer->booking_trust === 'restricted') {
                $pendingCount = Appointment::where('customer_id', $existingCustomer->id)
                    ->whereIn('status', ['confirmed'])
                    ->where('starts_at', '>', now())
                    ->count();
                if ($pendingCount >= 1) {
                    return back()->withErrors([
                        'customer_phone' => trans('booking.errorNeedApproval'),
                    ]);
                }
            }

            // One active appointment rule
            $activeCount = Appointment::where('customer_id', $existingCustomer->id)
                ->whereNotIn('status', ['cancelled', 'no_show', 'completed'])
                ->where('starts_at', '>', now())
                ->count();
            if ($activeCount >= 1) {
                return back()->withErrors([
                    'customer_phone' => trans('booking.errorExistingAppt'),
                ]);
            }

            // Duplicate: same phone + same barber + same time
            $duplicate = Appointment::where('customer_id', $existingCustomer->id)
                ->where('barber_id', $barber->id)
                ->where('starts_at', $startsAt)
                ->whereNotIn('status', ['cancelled', 'no_show'])
                ->exists();
            if ($duplicate) {
                return back()->withErrors([
                    'starts_at' => trans('booking.errorDuplicate'),
                ]);
            }
        }

        // ── 14. Create / update customer ───────────────────────────────────────
        $customer = Customer::firstOrCreate(
            ['phone' => $phone, 'company_id' => $company->id],
            ['name'  => $validated['customer_name']]
        );
        $customer->fill(['name' => $validated['customer_name']])->save();

        // ── 15. Create appointment ─────────────────────────────────────────────
        $cancelToken   = Str::random(48);
        $cancelExpires = now()->addSeconds(60);

        $isFirstTimer      = ! $existingCustomer || $existingCustomer->booking_total < 1;
        $appointmentStatus = $isFirstTimer ? 'pending' : 'confirmed';

        $appointment = Appointment::create([
            'company_id'              => $company->id,
            'barber_id'               => $barber->id,
            'customer_id'             => $customer->id,
            'service_id'              => $services->first()->id,
            'starts_at'               => $startsAt,
            'ends_at'                 => $endsAt,
            'price'                   => $totalPrice,
            'status'                  => $appointmentStatus,
            'booking_source'          => 'public_booking',
            'notes'                   => $validated['notes'] ?? '',
            'cancel_token'            => $cancelToken,
            'cancel_token_expires_at' => $cancelExpires,
        ]);

        if ($services->isNotEmpty()) {
            $pivotData = $services->mapWithKeys(fn($s) => [
                $s->id => ['price' => $s->price, 'duration' => $s->duration]
            ])->all();
            $appointment->services()->attach($pivotData);
        }
        $appointment->load(['barber.user', 'customer', 'service']);

        // ── 16. Broadcast real-time update ────────────────────────────────────
        try { broadcast(new AppointmentChanged($appointment)); } catch (\Throwable) {}

        // ── 17. Notify barber + admins ─────────────────────────────────────────
        if ($barber->user) {
            $barber->user->notify(new NewPublicBooking($appointment));
        }
        $barberUserId = $barber->user?->id;
        User::where('company_id', $company->id)
            ->whereHas('roles', fn($q) => $q->whereIn('name', ['shop-admin', 'platform-admin']))
            ->when($barberUserId, fn($q) => $q->where('id', '!=', $barberUserId))
            ->each(fn(User $u) => $u->notify(new NewPublicBooking($appointment)));

        // ── 17. Commit rate limits + update fingerprint ────────────────────────
        RateLimiter::hit($phoneKey, $phoneWindow);
        RateLimiter::hit($cooldownKey, 120);

        if ($fingerprint) {
            DB::table('booking_fingerprints')
                ->where('id', $fingerprint->id)
                ->update([
                    'booking_count'   => $fingerprint->booking_count + 1,
                    'last_booking_at' => now(),
                    'user_agent'      => $userAgent,
                    'updated_at'      => now(),
                ]);
        } else {
            DB::table('booking_fingerprints')->insert([
                'phone'           => $phone,
                'ip_address'      => $ip,
                'user_agent'      => $userAgent,
                'booking_count'   => 1,
                'last_booking_at' => now(),
                'created_at'      => now(),
                'updated_at'      => now(),
            ]);
        }

        $customer->increment('booking_total');

        return redirect()->route('booking.confirmation', $slug)
            ->with('cancel_token', $cancelToken)
            ->with('cancel_expires_at', $cancelExpires->toIso8601String())
            ->with('appt_starts_at', $startsAt->format('Y-m-d H:i'))
            ->with('appt_barber_name', $barber->user?->name)
            ->with('appt_services', $services->pluck('name')->join(', '));
    }

    public function confirmation(string $slug)
    {
        $company = Company::where('slug', $slug)->where('is_active', true)->firstOrFail();

        return Inertia::render('booking/Confirmation', [
            'company'           => array_merge(
                $company->only('id', 'name', 'slug', 'phone'),
                ['logo' => $company->logo ? asset('storage/' . $company->logo) : null]
            ),
            'cancel_token'      => session('cancel_token'),
            'cancel_expires_at' => session('cancel_expires_at'),
            'appt_starts_at'    => session('appt_starts_at'),
            'appt_barber_name'  => session('appt_barber_name'),
            'appt_services'     => session('appt_services'),
        ]);
    }

    private function verifyTurnstile(string $token, string $ip, string $secret): bool
    {
        if (empty($token)) {
            return false;
        }
        try {
            $response = Http::asForm()->post('https://challenges.cloudflare.com/turnstile/v0/siteverify', [
                'secret'   => $secret,
                'response' => $token,
                'remoteip' => $ip,
            ]);
            return (bool) ($response->json('success') ?? false);
        } catch (\Throwable) {
            return false;
        }
    }
}
