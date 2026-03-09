<?php

namespace App\Http\Controllers;

use App\Models\Barber;
use App\Models\Company;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

/**
 * Returns available time slots for a barber on a given date,
 * accounting for working hours, time-off, and existing appointments.
 */
class BookingSlotsController extends Controller
{
    /**
     * GET /book/{slug}/slots?barber_id=&service_id=&date=
     *
     * Returns:
     *   slots: string[]            — available "HH:MM" times
     *   next_available: string|null — earliest slot if today
     */
    public function __invoke(Request $request, string $slug)
    {
        $company = Company::where('slug', $slug)->where('is_active', true)->firstOrFail();

        $request->validate([
            'barber_id'  => 'required|integer',
            'service_id' => 'required|integer',
            'date'       => 'required|date_format:Y-m-d',
        ]);

        $barber = Barber::where('id', $request->barber_id)
            ->where('company_id', $company->id)
            ->where('is_active', true)
            ->firstOrFail();

        $service = Service::where('id', $request->service_id)
            ->where('company_id', $company->id)
            ->firstOrFail();

        $date    = Carbon::parse($request->date)->startOfDay();
        $dayKey  = strtolower($date->format('l')); // 'monday'
        $shortKey = substr($dayKey, 0, 3);          // 'mon' (legacy seeder format)

        // Resolve working hours for this day
        $hours = $barber->working_hours;
        $dayHours = $hours[$dayKey] ?? $hours[$shortKey] ?? null;

        // Determine business window
        if ($dayHours) {
            // New format: { enabled, start, end }
            if (isset($dayHours['enabled'])) {
                if (! $dayHours['enabled']) {
                    return response()->json(['slots' => [], 'next_available' => null]);
                }
                $windowStart = $dayHours['start'] ?? '09:00';
                $windowEnd   = $dayHours['end']   ?? '17:00';
            } else {
                // Legacy format: ['09:00', '17:00']
                [$windowStart, $windowEnd] = array_values($dayHours);
            }
        } else {
            // No schedule set — use default business hours
            $windowStart = '09:00';
            $windowEnd   = '18:00';
        }

        // Check time-off
        $dateStr = $date->format('Y-m-d');
        $onTimeOff = \DB::table('barber_time_offs')
            ->where('barber_id', $barber->id)
            ->where('starts_on', '<=', $dateStr)
            ->where('ends_on', '>=', $dateStr)
            ->exists();

        if ($onTimeOff) {
            return response()->json(['slots' => [], 'next_available' => null]);
        }

        // Load existing appointments for this barber on this day
        $dayStart = $date->copy()->setTimeFromTimeString($windowStart);
        $dayEnd   = $date->copy()->setTimeFromTimeString($windowEnd);

        $booked = \App\Models\Appointment::where('barber_id', $barber->id)
            ->whereNotIn('status', ['cancelled', 'no_show'])
            ->where('starts_at', '>=', $date->copy()->startOfDay())
            ->where('starts_at', '<', $date->copy()->endOfDay())
            ->get(['starts_at', 'ends_at']);

        // Generate candidate slots (every 30 min within window)
        $slotInterval = 30; // minutes
        $serviceDuration = $service->duration; // minutes
        $slots = [];
        $now = Carbon::now();

        $cursor = $date->copy()->setTimeFromTimeString($windowStart);
        $windowEndTime = $date->copy()->setTimeFromTimeString($windowEnd);

        while ($cursor->copy()->addMinutes($serviceDuration)->lte($windowEndTime)) {
            $slotStart = $cursor->copy();
            $slotEnd   = $cursor->copy()->addMinutes($serviceDuration);

            // Skip past times (for today)
            if ($slotStart->lte($now)) {
                $cursor->addMinutes($slotInterval);
                continue;
            }

            // Check for conflicts with existing appointments
            $conflict = false;
            foreach ($booked as $appt) {
                $apptStart = Carbon::parse($appt->starts_at);
                $apptEnd   = Carbon::parse($appt->ends_at);

                // Overlap: slot starts before appt ends AND slot ends after appt starts
                if ($slotStart->lt($apptEnd) && $slotEnd->gt($apptStart)) {
                    $conflict = true;
                    break;
                }
            }

            if (! $conflict) {
                $slots[] = $slotStart->format('H:i');
            }

            $cursor->addMinutes($slotInterval);
        }

        $nextAvailable = count($slots) > 0 ? $slots[0] : null;

        return response()->json([
            'slots'          => $slots,
            'next_available' => $nextAvailable,
        ]);
    }
}
