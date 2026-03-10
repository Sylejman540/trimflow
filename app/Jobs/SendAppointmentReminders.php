<?php

namespace App\Jobs;

use App\Models\Appointment;
use App\Notifications\AppointmentReminder;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Carbon;

class SendAppointmentReminders implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        $windowStart = Carbon::now()->addMinutes(50);
        $windowEnd   = Carbon::now()->addMinutes(70);

        Appointment::with(['customer.user', 'barber.user', 'service'])
            ->whereIn('status', ['confirmed'])
            ->whereBetween('starts_at', [$windowStart, $windowEnd])
            ->get()
            ->each(function (Appointment $appointment) {
                $notifiable = $appointment->customer?->user ?? $appointment->customer;
                if (! $notifiable) return;

                // Customer user account: use Laravel notifications
                if ($appointment->customer?->user) {
                    $appointment->customer->user->notify(new AppointmentReminder($appointment));
                    return;
                }

                // Guest customer with email only: send ad-hoc mail notification
                if ($appointment->customer?->email) {
                    \Illuminate\Support\Facades\Notification::route('mail', [
                        $appointment->customer->email => $appointment->customer->name,
                    ])->notify(new AppointmentReminder($appointment));
                }
            });
    }
}
