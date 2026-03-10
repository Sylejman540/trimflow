<?php

namespace App\Http\Controllers;

use App\Models\Barber;
use App\Models\Company;
use App\Models\Service; // used for duration sum
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

/**
 * Returns each barber's next available slot for a given service.
 * Used by the instant booking mode ("Alex — next available 14:30").
 */
class BookingAvailabilityController extends Controller
{
    /**
     * GET /book/{slug}/availability?service_id=
     */
    public function __invoke(Request $request, string $slug)
    {
        $company = Company::where('slug', $slug)->where('is_active', true)->firstOrFail();

        $request->validate([
            'service_ids'   => 'sometimes|array|min:1',
            'service_ids.*' => 'integer',
            // Legacy single-service support
            'service_id'    => 'sometimes|integer',
        ]);

        // Accept either service_ids[] (new) or service_id (legacy)
        $serviceIds = $request->input('service_ids')
            ?? ($request->input('service_id') ? [$request->input('service_id')] : []);

        if (empty($serviceIds)) {
            return response()->json(['barbers' => []]);
        }

        $services = Service::whereIn('id', $serviceIds)
            ->where('company_id', $company->id)
            ->get();

        $totalDuration = (int) $services->sum('duration');
        if ($totalDuration === 0) {
            return response()->json(['barbers' => []]);
        }

        $barbers = Barber::where('company_id', $company->id)
            ->where('is_active', true)
            ->with('user')
            ->get();

        $now = Carbon::now();
        $result = [];

        foreach ($barbers as $barber) {
            $nextSlot = $this->findNextSlot($barber, $totalDuration, $now);
            $result[] = [
                'id'             => $barber->id,
                'name'           => $barber->user->name,
                'specialty'      => $barber->specialty,
                'next_available' => $nextSlot?->format('Y-m-d H:i'),
                'next_time_label'=> $nextSlot ? $this->humanLabel($nextSlot, $now) : null,
            ];
        }

        // Sort by earliest next available
        usort($result, fn($a, $b) => strcmp($a['next_available'] ?? 'z', $b['next_available'] ?? 'z'));

        return response()->json(['barbers' => $result]);
    }

    private function findNextSlot(Barber $barber, int $totalDuration, Carbon $now): ?Carbon
    {
        // Look up to 14 days ahead
        for ($dayOffset = 0; $dayOffset <= 14; $dayOffset++) {
            $date    = $now->copy()->addDays($dayOffset)->startOfDay();
            $dayKey  = strtolower($date->format('l'));
            $shortKey = substr($dayKey, 0, 3);

            $hours    = $barber->working_hours;
            $dayHours = $hours[$dayKey] ?? $hours[$shortKey] ?? null;

            if ($dayHours) {
                if (isset($dayHours['enabled'])) {
                    if (! $dayHours['enabled']) continue;
                    $windowStart = $dayHours['start'] ?? '09:00';
                    $windowEnd   = $dayHours['end']   ?? '17:00';
                } else {
                    [$windowStart, $windowEnd] = array_values($dayHours);
                }
            } else {
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

            if ($onTimeOff) continue;

            $booked = \App\Models\Appointment::where('barber_id', $barber->id)
                ->whereNotIn('status', ['cancelled', 'no_show'])
                ->where('starts_at', '>=', $date->copy()->startOfDay())
                ->where('starts_at', '<', $date->copy()->endOfDay())
                ->get(['starts_at', 'ends_at']);

            $cursor = $date->copy()->setTimeFromTimeString($windowStart);
            $windowEndTime = $date->copy()->setTimeFromTimeString($windowEnd);

            while ($cursor->copy()->addMinutes($totalDuration)->lte($windowEndTime)) {
                $slotStart = $cursor->copy();
                $slotEnd   = $cursor->copy()->addMinutes($totalDuration);

                if ($slotStart->lte($now)) {
                    $cursor->addMinutes($totalDuration);
                    continue;
                }

                $conflict = false;
                foreach ($booked as $appt) {
                    $apptStart = \Carbon\Carbon::parse($appt->starts_at);
                    $apptEnd   = \Carbon\Carbon::parse($appt->ends_at);
                    if ($slotStart->lt($apptEnd) && $slotEnd->gt($apptStart)) {
                        $conflict = true;
                        break;
                    }
                }

                if (! $conflict) {
                    return $slotStart;
                }

                $cursor->addMinutes($totalDuration);
            }
        }

        return null;
    }

    private function humanLabel(Carbon $slot, Carbon $now): string
    {
        if ($slot->isToday()) {
            return 'Today ' . $slot->format('H:i');
        }
        if ($slot->isTomorrow()) {
            return 'Tomorrow ' . $slot->format('H:i');
        }
        return $slot->format('D, M j') . ' ' . $slot->format('H:i');
    }
}
