<?php

namespace App\Notifications;

use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewInternalAppointment extends Notification
{
    use Queueable;

    public function __construct(public readonly Appointment $appointment) {}

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
        $time     = $this->appointment->starts_at->format('M j \a\t g:i A');

        return [
            'appointment_id' => $this->appointment->id,
            'message'        => "{$customer} booked {$service} on {$time}.",
            'status'         => 'confirmed',
            'icon'           => 'calendar',
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $appt     = $this->appointment;
        $customer = $appt->customer?->name ?? 'A customer';
        $phone    = $appt->customer?->phone ?? null;
        $service  = $appt->service?->name  ?? 'appointment';

        // If multiple services are loaded on the appointment, join names
        $serviceLabel = ($appt->relationLoaded('services') && $appt->services->count() > 1)
            ? $appt->services->pluck('name')->join(', ')
            : $service;

        $time = $appt->starts_at->format('l, F j \a\t g:i A');

        return (new MailMessage)
            ->subject("New Appointment: {$customer} — {$serviceLabel}")
            ->greeting('New appointment created!')
            ->line("**Customer:** {$customer}" . ($phone ? " · {$phone}" : ''))
            ->line("**Service:** {$serviceLabel}")
            ->line("**When:** {$time}")
            ->when($appt->notes, function ($message) use ($appt) {
                return $message->line("**Notes:** {$appt->notes}");
            })
            ->salutation('— Fade');
    }
}
