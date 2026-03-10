<?php

namespace App\Notifications;

use App\Channels\TwilioSmsChannel;
use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AppointmentReminder extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public readonly Appointment $appointment) {}

    public function via(object $notifiable): array
    {
        $channels = ['database'];

        if (! empty($notifiable->email)) {
            $channels[] = 'mail';
        }

        if (! empty($notifiable->phone) && config('services.twilio.sid')) {
            $channels[] = TwilioSmsChannel::class;
        }

        return $channels;
    }

    public function toDatabase(object $notifiable): array
    {
        $appt    = $this->appointment;
        $service = $appt->service?->name ?? 'appointment';
        $time    = $appt->starts_at->format('g:i A');

        return [
            'appointment_id' => $appt->id,
            'message'        => "Reminder: {$service} in 1 hour at {$time}.",
            'icon'           => 'clock',
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $appt    = $this->appointment;
        $barber  = $appt->barber?->user?->name ?? 'your barber';
        $service = $appt->service?->name ?? 'your appointment';
        $time    = $appt->starts_at->format('l, F j \a\t g:i A');

        return (new MailMessage)
            ->subject("Reminder: {$service} in 1 hour")
            ->greeting("Hi {$notifiable->name},")
            ->line('Your appointment is coming up in about 1 hour.')
            ->line("**Service:** {$service}")
            ->line("**Barber:** {$barber}")
            ->line("**When:** {$time}")
            ->action('View Appointment', url('/appointments/' . $appt->id))
            ->salutation('See you soon!');
    }

    public function toTwilioSms(object $notifiable): string
    {
        $appt    = $this->appointment;
        $service = $appt->service?->name ?? 'appointment';
        $barber  = $appt->barber?->user?->name ?? 'your barber';
        $time    = $appt->starts_at->format('g:i A');
        $shop    = $appt->company?->name ?? config('app.name');

        return "Hi {$notifiable->name}! Reminder from {$shop}: your {$service} with {$barber} is at {$time} today. See you soon!";
    }
}
