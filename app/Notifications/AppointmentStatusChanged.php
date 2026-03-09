<?php

namespace App\Notifications;

use App\Models\Appointment;
use Illuminate\Bus\Queueable;
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
        return ['database'];
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
}
