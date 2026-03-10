<?php

namespace App\Http\Controllers;

use App\Models\Barber;
use App\Models\BarberTimeOff;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class BarberTimeOffController extends Controller
{
    public function index()
    {
        $this->authorize('viewAny', Barber::class);

        $timeOffs = BarberTimeOff::with('barber.user')
            ->orderBy('starts_on')
            ->get()
            ->map(fn ($t) => [
                'id'        => $t->id,
                'starts_on' => $t->starts_on->format('Y-m-d'),
                'ends_on'   => $t->ends_on->format('Y-m-d'),
                'reason'    => $t->reason,
                'barber'    => ['id' => $t->barber->id, 'user' => ['name' => $t->barber->user->name]],
            ]);

        return Inertia::render('barbers/TimeOff', [
            'time_offs' => $timeOffs,
            'barbers'   => Barber::with('user')->where('is_active', true)->get(),
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('create', Barber::class);

        $validated = $request->validate([
            'barber_id' => 'required|exists:barbers,id',
            'starts_on' => 'required|date',
            'ends_on'   => 'required|date|after_or_equal:starts_on',
            'reason'    => 'nullable|string|max:255',
        ]);

        // Ensure the barber belongs to this company
        $barber = Barber::where('id', $validated['barber_id'])
            ->where('company_id', Auth::user()->company_id)
            ->firstOrFail();

        BarberTimeOff::create($validated);

        return back()->with('success', 'Time off added.');
    }

    public function destroy(BarberTimeOff $timeOff)
    {
        $this->authorize('delete', $timeOff->barber);

        $timeOff->delete();

        return back()->with('success', 'Time off removed.');
    }
}
