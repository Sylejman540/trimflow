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

        $user   = Auth::user();
        $barber = Barber::findOrFail($barberId);

        // Verify the barber belongs to the authenticated user's company
        // and that the user is authorized to connect this barber's calendar
        if ($barber->company_id !== $user->company_id) {
            abort(403);
        }
        if ($user->barber?->id !== $barber->id && ! $user->hasRole('shop-admin')) {
            abort(403);
        }

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
