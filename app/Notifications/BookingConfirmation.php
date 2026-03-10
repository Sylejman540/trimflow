<?php

namespace App\Notifications;

use App\Channels\TwilioSmsChannel;
use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class BookingConfirmation extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public readonly Appointment $appointment) {}

    public function via(object $notifiable): array
    {
        $channels = [];

        if (! empty($notifiable->phone) && config('services.twilio.sid')) {
            $channels[] = TwilioSmsChannel::class;
        }

        return $channels;
    }

    public function toTwilioSms(object $notifiable): string
    {
        $appt    = $this->appointment;
        $service = $appt->service?->name ?? 'appointment';
        $barber  = $appt->barber?->user?->name ?? 'your barber';
        $time    = $appt->starts_at->format('l, M j \a\t g:i A');
        $shop    = $appt->company?->name ?? config('app.name');
        $status  = $appt->status === 'pending' ? 'received and pending confirmation' : 'confirmed';

        return "Hi {$notifiable->name}! Your booking at {$shop} is {$status}. {$service} with {$barber} on {$time}. See you soon!";
    }
}
