<?php

namespace App\Http\Controllers;

use App\Models\Barber;
use App\Services\GoogleCalendarService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BarberGoogleCalendarController extends Controller
{
    public function connect(Barber $barber, GoogleCalendarService $google)
    {
        // Only the barber themselves or an admin can connect
        $user = Auth::user();
        if ($user->barber?->id !== $barber->id && ! $user->hasRole('shop-admin')) {
            abort(403);
        }

        return redirect($google->getAuthUrl($barber->id));
    }

    public function callback(Request $request, GoogleCalendarService $google)
    {
        $barberId = $request->input('state');
        $code     = $request->input('code');
        $error    = $request->input('error');

        if ($error || ! $barberId || ! $code) {
            return redirect()->route('barbers.index')->with('error', 'Google Calendar connection was cancelled.');
        }

        $barber = Barber::findOrFail($barberId);
        $success = $google->handleCallback($barber, $code);

        if ($success) {
            return redirect()->route('barbers.edit', $barber->id)
                ->with('success', 'Google Calendar connected successfully!');
        }

        return redirect()->route('barbers.edit', $barber->id)
            ->with('error', 'Failed to connect Google Calendar. Please try again.');
    }

    public function disconnect(Barber $barber, GoogleCalendarService $google)
    {
        $user = Auth::user();
        if ($user->barber?->id !== $barber->id && ! $user->hasRole('shop-admin')) {
            abort(403);
        }

        $google->disconnect($barber);
        return back()->with('success', 'Google Calendar disconnected.');
    }
}
