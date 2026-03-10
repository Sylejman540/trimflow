<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Barber;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ScheduleController extends Controller
{
    public function index(Request $request)
    {
        $user          = Auth::user();
        $isBarber      = $user->hasRole('barber') && !$user->hasRole('shop-admin');
        $isOwnerBarber = $user->hasRole('shop-admin') && $user->hasRole('barber') && $user->barber;
        $filterMine    = $isOwnerBarber && $request->boolean('mine');
        $barberId      = ($isBarber || $filterMine) ? $user->barber?->id : null;

        $view = $request->get('view', 'week'); // 'day', 'week', or 'month'
        $date = $request->get('date', Carbon::today()->toDateString());

        $anchor = Carbon::parse($date);

        if ($view === 'week') {
            $start = $anchor->copy()->startOfWeek();
            $end   = $anchor->copy()->endOfWeek();
        } elseif ($view === 'month') {
            $start = $anchor->copy()->startOfMonth()->startOfWeek(); // include leading days from prev month
            $end   = $anchor->copy()->endOfMonth()->endOfWeek();
        } else {
            $start = $anchor->copy()->startOfDay();
            $end   = $anchor->copy()->endOfDay();
        }

        $appointments = Appointment::with(['barber.user', 'customer', 'service'])
            ->when($barberId, fn ($q) => $q->where('barber_id', $barberId))
            ->whereBetween('starts_at', [$start, $end])
            ->whereNotIn('status', ['cancelled'])
            ->orderBy('starts_at')
            ->get()
            ->each(fn (Appointment $a) => $a->resolveStatus())
            ->map(fn (Appointment $a) => [
                'id'           => $a->id,
                'starts_at'    => $a->starts_at->toIso8601String(),
                'ends_at'      => $a->ends_at->toIso8601String(),
                'status'       => $a->status,
                'customer'     => $a->customer?->name ?? 'Walk-in',
                'service'      => $a->service?->name ?? '-',
                'barber'       => $a->barber?->user?->name ?? '-',
                'price'        => $a->price,
            ]);

        // Compute earliest start / latest end across all active barbers' schedules
        $allBarbers = Barber::where('is_active', true)->get(['working_hours']);
        $hourStart = 8;
        $hourEnd   = 20;

        foreach ($allBarbers as $b) {
            foreach (($b->working_hours ?? []) as $day) {
                if (isset($day['enabled']) && ! $day['enabled']) continue;
                $s = $day['start'] ?? ($day[0] ?? null);
                $e = $day['end']   ?? ($day[1] ?? null);
                if ($s) $hourStart = min($hourStart, (int) explode(':', $s)[0]);
                if ($e) $hourEnd   = max($hourEnd,   (int) explode(':', $e)[0]);
            }
        }

        // 1-hour buffer, clamped to valid range
        $hourStart = max(0,  $hourStart - 1);
        $hourEnd   = min(24, $hourEnd   + 1);

        return Inertia::render('schedule/Index', [
            'appointments'    => $appointments,
            'view'            => $view,
            'date'            => $date,
            'start'           => $start->toDateString(),
            'end'             => $end->toDateString(),
            'barbers'         => $isBarber ? [] : Barber::with('user')->where('is_active', true)->get(['id'])->map(fn ($b) => ['id' => $b->id, 'name' => $b->user?->name]),
            'is_barber'       => $isBarber,
            'is_owner_barber' => $isOwnerBarber,
            'filter_mine'     => $filterMine,
            'hour_start'      => $hourStart,
            'hour_end'        => $hourEnd,
        ]);
    }

    /**
     * PATCH /schedule/{appointment}/reschedule
     * Drag-and-drop reschedule: update starts_at / ends_at only.
     */
    public function reschedule(Request $request, Appointment $appointment)
    {
        $this->authorize('update', $appointment);

        $validated = $request->validate([
            'starts_at' => 'required|date',
        ]);

        $duration = $appointment->starts_at->diffInMinutes($appointment->ends_at);
        $newStart = Carbon::parse($validated['starts_at']);
        $newEnd   = $newStart->copy()->addMinutes($duration);

        // Double-booking check (exclude self)
        $conflict = Appointment::where('barber_id', $appointment->barber_id)
            ->where('id', '!=', $appointment->id)
            ->whereNotIn('status', ['cancelled', 'no_show'])
            ->where('starts_at', '<', $newEnd)
            ->where('ends_at', '>', $newStart)
            ->exists();

        if ($conflict) {
            return response()->json(['error' => 'Time slot conflict.'], 422);
        }

        $appointment->update([
            'starts_at' => $newStart,
            'ends_at'   => $newEnd,
        ]);

        return response()->json(['ok' => true]);
    }
}
