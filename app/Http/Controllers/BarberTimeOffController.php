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
        $timeOffs = BarberTimeOff::with('barber.user')
            ->orderBy('starts_on')
            ->get();

        return Inertia::render('barbers/TimeOff', [
            'time_offs' => $timeOffs,
            'barbers'   => Barber::with('user')->where('is_active', true)->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'barber_id' => 'required|exists:barbers,id',
            'starts_on' => 'required|date',
            'ends_on'   => 'required|date|after_or_equal:starts_on',
            'reason'    => 'nullable|string|max:255',
        ]);

        BarberTimeOff::create($validated);

        return back()->with('success', 'Time off added.');
    }

    public function destroy(BarberTimeOff $timeOff)
    {
        $timeOff->delete();

        return back()->with('success', 'Time off removed.');
    }
}
