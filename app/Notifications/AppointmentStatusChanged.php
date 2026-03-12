<?php

namespace App\Notifications;

use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AppointmentStatusChanged extends Notification
{
    use Queueable;

    public function __construct(
        public readonly Appointment $appointment,
        public readonly string $previousStatus,
    ) {}

    public function via(object $notifiable): array
    {
        $channels = ['database'];

        if (! empty($notifiable->email)) {
            $channels[] = 'mail';
        }

        return $channels;
    }

    public function toDatabase(object $notifiable): array
    {
        $customer = $this->appointment->customer?->name ?? 'A customer';
        $service  = $this->appointment->service?->name  ?? 'appointment';
        $status   = ucfirst(str_replace('_', ' ', $this->appointment->status));

        return [
            'appointment_id' => $this->appointment->id,
            'message'        => "{$customer}'s {$service} is now {$status}.",
            'status'         => $this->appointment->status,
            'icon'           => match ($this->appointment->status) {
                'confirmed'   => 'check',
                'completed'   => 'check-circle',
                'cancelled'   => 'x-circle',
                'no_show'     => 'alert',
                default       => 'calendar',
            },
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $appt     = $this->appointment;
        $customer = $appt->customer?->name ?? 'A customer';
        $service  = $appt->service?->name  ?? 'appointment';
        $barber   = $appt->barber?->user?->name ?? 'your barber';
        $status   = ucfirst(str_replace('_', ' ', $appt->status));
        $time     = $appt->starts_at->format('l, F j \a\t g:i A');

        return (new MailMessage)
            ->subject("Appointment {$status}: {$customer} — {$service}")
            ->greeting("Hi {$notifiable->name},")
            ->line("An appointment status has changed to **{$status}**.")
            ->line("**Customer:** {$customer}")
            ->line("**Service:** {$service}")
            ->line("**Barber:** {$barber}")
            ->line("**When:** {$time}")
            ->salutation('— TrimFlow');
    }
}
