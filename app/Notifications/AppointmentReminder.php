<?php

namespace App\Notifications;

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
        return ['mail', 'database'];
    }

    public function toDatabase(object $notifiable): array
    {
        $appt    = $this->appointment;
        $service = $appt->service?->name ?? 'appointment';
        $time    = $appt->starts_at->format('g:i A');

        return [
            'appointment_id' => $appt->id,
            'message'        => "Reminder: {$service} tomorrow at {$time}.",
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
            ->subject("Reminder: {$service} tomorrow")
            ->greeting("Hi {$notifiable->name},")
            ->line("This is a friendly reminder about your upcoming appointment.")
            ->line("**Service:** {$service}")
            ->line("**Barber:** {$barber}")
            ->line("**When:** {$time}")
            ->action('View Appointment', url('/appointments/' . $appt->id))
            ->line('If you need to cancel or reschedule, please do so at least 2 hours in advance.')
            ->salutation('See you soon!');
    }
}
