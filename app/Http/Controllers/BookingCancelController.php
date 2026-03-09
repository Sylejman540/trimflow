<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use Illuminate\Http\Request;

class BookingCancelController extends Controller
{
    public function __invoke(Request $request, string $slug)
    {
        $request->validate(['token' => 'required|string']);

        $appointment = Appointment::where('cancel_token', $request->token)->firstOrFail();

        // Check the window hasn't expired (server-side guard)
        if (! $appointment->cancel_token_expires_at || now()->isAfter($appointment->cancel_token_expires_at)) {
            return back()->withErrors(['token' => 'The cancellation window has expired.']);
        }

        $appointment->update([
            'status'                  => 'cancelled',
            'cancel_token'            => null,
            'cancel_token_expires_at' => null,
        ]);

        return back()->with('cancelled', true);
    }
}
