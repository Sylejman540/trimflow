<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\User;
use App\Notifications\AppointmentStatusChanged;
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

        $previousStatus = $appointment->status;

        $appointment->update([
            'status'                  => 'cancelled',
            'cancel_token'            => null,
            'cancel_token_expires_at' => null,
        ]);

        // Notify shop admin and barber of public cancellation
        $appointment->load(['customer', 'service', 'barber.user']);

        $barberUserId = $appointment->barber?->user?->id;

        User::where('company_id', $appointment->company_id)
            ->whereHas('roles', fn($q) => $q->whereIn('name', ['shop-admin', 'platform-admin']))
            ->when($barberUserId, fn($q) => $q->where('id', '!=', $barberUserId))
            ->each(fn(User $u) => $u->notify(new AppointmentStatusChanged($appointment, $previousStatus)));

        if ($appointment->barber?->user) {
            $appointment->barber->user->notify(new AppointmentStatusChanged($appointment, $previousStatus));
        }

        return back()->with('cancelled', true);
    }
}
