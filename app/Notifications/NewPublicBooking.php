<?php

namespace App\Notifications;

use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class NewPublicBooking extends Notification
{
    use Queueable;

    public function __construct(public readonly Appointment $appointment) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        $customer = $this->appointment->customer?->name ?? 'A customer';
        $service  = $this->appointment->service?->name  ?? 'appointment';
        $time     = $this->appointment->starts_at->format('M j \a\t g:i A');

        return [
            'appointment_id' => $this->appointment->id,
            'message'        => "New booking: {$customer} booked {$service} on {$time}.",
            'status'         => 'scheduled',
            'icon'           => 'calendar',
        ];
    }
}
