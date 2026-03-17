<?php

namespace App\Notifications;

use App\Events\NotificationCreated;
use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Event;

class NewPublicBooking extends Notification
{
    use Queueable;

    public function __construct(public readonly Appointment $appointment) {}

    public function via(object $notifiable): array
    {
        $channels = ['database'];

        if (! empty($notifiable->email)) {
            $channels[] = 'mail';
        }

        // Broadcast notification created event
        Event::dispatch(new NotificationCreated(
            $this->appointment->company_id,
            $notifiable->id
        ));

        return $channels;
    }

    public function toDatabase(object $notifiable): array
    {
        $customer = $this->appointment->customer?->name ?? 'A customer';
        $service  = $this->appointment->service?->name  ?? 'appointment';
        $time     = $this->appointment->starts_at->format('M j \a\t H:i');

        return [
            'appointment_id' => $this->appointment->id,
            'message'        => "New booking: {$customer} booked {$service} on {$time}.",
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

        $time   = $appt->starts_at->format('l, F j \a\t H:i');
        $barber = $appt->barber?->user?->name ?? 'your barber';

        $mail = (new MailMessage)
            ->subject("New Booking: {$customer} — {$serviceLabel}")
            ->greeting('New appointment booked!')
            ->line("**Customer:** {$customer}" . ($phone ? " · {$phone}" : ''))
            ->line("**Service:** {$serviceLabel}")
            ->line("**Barber:** {$barber}")
            ->line("**When:** {$time}");

        if ($appt->notes) {
            $mail->line("**Notes:** {$appt->notes}");
        }

        return $mail->salutation('— Fade');
    }
}
