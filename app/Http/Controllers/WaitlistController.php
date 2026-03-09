<?php

namespace App\Http\Controllers;

use App\Models\Barber;
use App\Models\Service;
use App\Models\WaitlistEntry;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WaitlistController extends Controller
{
    public function index()
    {
        $entries = WaitlistEntry::with(['barber.user', 'service'])
            ->orderByRaw("FIELD(status, 'waiting', 'notified', 'booked', 'expired')")
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('waitlist/Index', [
            'entries' => $entries,
        ]);
    }

    public function create()
    {
        return Inertia::render('waitlist/Create', [
            'barbers'  => Barber::with('user')->where('is_active', true)->get(),
            'services' => Service::where('is_active', true)->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_name'  => 'required|string|max:255',
            'customer_email' => 'nullable|email|max:255',
            'customer_phone' => 'nullable|string|max:50',
            'barber_id'      => 'nullable|exists:barbers,id',
            'service_id'     => 'nullable|exists:services,id',
            'preferred_date' => 'nullable|date',
            'notes'          => 'nullable|string|max:1000',
        ]);

        WaitlistEntry::create($validated);

        return redirect()->route('waitlist.index')->with('success', 'Added to waitlist.');
    }

    public function update(Request $request, WaitlistEntry $waitlist)
    {
        $validated = $request->validate([
            'status' => 'required|in:waiting,notified,booked,expired',
        ]);

        $waitlist->update($validated);

        if ($validated['status'] === 'notified') {
            $waitlist->update(['notified_at' => now()]);
        }

        return back()->with('success', 'Waitlist entry updated.');
    }

    public function destroy(WaitlistEntry $waitlist)
    {
        $waitlist->delete();

        return redirect()->route('waitlist.index')->with('success', 'Removed from waitlist.');
    }
}
