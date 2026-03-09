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
        $user     = Auth::user();
        $isBarber = $user->hasRole('barber') && !$user->hasRole('shop-admin');
        $barberId = $isBarber ? $user->barber?->id : null;

        $view = $request->get('view', 'week'); // 'day' or 'week'
        $date = $request->get('date', Carbon::today()->toDateString());

        $anchor = Carbon::parse($date);

        if ($view === 'week') {
            $start = $anchor->copy()->startOfWeek();
            $end   = $anchor->copy()->endOfWeek();
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

        return Inertia::render('schedule/Index', [
            'appointments' => $appointments,
            'view'         => $view,
            'date'         => $date,
            'start'        => $start->toDateString(),
            'end'          => $end->toDateString(),
            'barbers'      => $isBarber ? [] : Barber::with('user')->where('is_active', true)->get(['id'])->map(fn ($b) => ['id' => $b->id, 'name' => $b->user?->name]),
            'is_barber'    => $isBarber,
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
