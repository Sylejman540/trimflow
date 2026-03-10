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
        $windowStart = Carbon::now()->addMinutes(50);
        $windowEnd   = Carbon::now()->addMinutes(70);

        Appointment::with(['customer.user', 'barber.user', 'service', 'company'])
            ->whereIn('status', ['confirmed', 'pending'])
            ->whereBetween('starts_at', [$windowStart, $windowEnd])
            ->whereNull('reminder_sent_at')
            ->get()
            ->each(function (Appointment $appointment) {
                $customer = $appointment->customer;
                if (! $customer) {
                    return;
                }

                try {
                    if ($customer->user) {
                        // Registered user — full notification (database + mail + SMS if configured)
                        $customer->user->notify(new AppointmentReminder($appointment));
                    } elseif ($customer->email) {
                        // Guest with email — send mail notification
                        Notification::route('mail', [$customer->email => $customer->name])
                            ->notify(new AppointmentReminder($appointment));
                    } elseif ($customer->phone && config('services.twilio.sid')) {
                        // Guest with phone only — SMS only
                        Notification::route('twilio_sms', $customer->phone)
                            ->notify(new AppointmentReminder($appointment));
                    }

                    $appointment->updateQuietly(['reminder_sent_at' => now()]);
                } catch (\Throwable $e) {
                    Log::error('Appointment reminder failed', [
                        'appointment_id' => $appointment->id,
                        'error'          => $e->getMessage(),
                    ]);
                }
            });
    }
}
