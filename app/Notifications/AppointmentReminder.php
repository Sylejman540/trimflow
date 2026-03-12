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

    /**
     * @param Appointment $appointment
     * @param string $recipientType  'customer' or 'barber'
     */
    public function __construct(
        public readonly Appointment $appointment,
        public readonly string $recipientType = 'customer',
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
        $appt    = $this->appointment;
        $service = $appt->service?->name ?? 'appointment';
        $time    = $appt->starts_at->format('g:i A');

        if ($this->recipientType === 'barber') {
            $customer = $appt->customer?->name ?? 'a customer';
            return [
                'appointment_id' => $appt->id,
                'message'        => "Reminder: {$customer}'s {$service} in 1 hour at {$time}.",
                'icon'           => 'clock',
            ];
        }

        return [
            'appointment_id' => $appt->id,
            'message'        => "Reminder: {$service} in 1 hour at {$time}.",
            'icon'           => 'clock',
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $appt    = $this->appointment;
        $service = $appt->service?->name ?? 'appointment';

        // If multiple services are loaded, join names
        $serviceLabel = ($appt->relationLoaded('services') && $appt->services->count() > 1)
            ? $appt->services->pluck('name')->join(', ')
            : $service;

        $time = $appt->starts_at->format('l, F j \a\t g:i A');

        if ($this->recipientType === 'barber') {
            $customer = $appt->customer?->name ?? 'a customer';
            $phone    = $appt->customer?->phone ?? null;

            return (new MailMessage)
                ->subject("Reminder: {$customer} — {$serviceLabel} in 1 hour")
                ->greeting("Hi {$notifiable->name},")
                ->line('You have an upcoming appointment in about 1 hour.')
                ->line("**Customer:** {$customer}" . ($phone ? " · {$phone}" : ''))
                ->line("**Service:** {$serviceLabel}")
                ->line("**When:** {$time}")
                ->salutation('— TrimFlow');
        }

        $barber = $appt->barber?->user?->name ?? 'your barber';

        return (new MailMessage)
            ->subject("Reminder: {$serviceLabel} in 1 hour")
            ->greeting("Hi {$notifiable->name},")
            ->line('Your appointment is coming up in about 1 hour.')
            ->line("**Service:** {$serviceLabel}")
            ->line("**Barber:** {$barber}")
            ->line("**When:** {$time}")
            ->salutation('See you soon! — TrimFlow');
    }
}
