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
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;

class SendAppointmentReminders implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        // Send reminder 15 minutes before appointment (±5 min window to avoid duplicates)
        $windowStart = Carbon::now()->addMinutes(10);
        $windowEnd   = Carbon::now()->addMinutes(20);

        Appointment::with(['customer', 'barber.user', 'service', 'company'])
            ->whereIn('status', ['confirmed', 'pending'])
            ->whereBetween('starts_at', [$windowStart, $windowEnd])
            ->whereNull('reminder_sent_at')
            ->get()
            ->each(function (Appointment $appointment) {
                $barber = $appointment->barber;
                if (! $barber || ! $barber->user) {
                    return;
                }

                try {
                    // Send reminder to the barber assigned to this appointment
                    $barber->user->notify(new AppointmentReminder($appointment, 'barber'));

                    $appointment->updateQuietly(['reminder_sent_at' => now()]);
                } catch (\Throwable $e) {
                    Log::error('Appointment reminder failed', [
                        'appointment_id' => $appointment->id,
                        'barber_id'      => $barber->id,
                        'error'          => $e->getMessage(),
                    ]);
                }
            });
    }
}
