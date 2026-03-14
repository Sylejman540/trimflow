<?php

namespace App\Events;

use App\Models\Appointment;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AppointmentChanged implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Appointment $appointment)
    {
        $this->appointment->load(['barber.user', 'customer', 'service', 'services']);
    }

    public function broadcastOn(): Channel
    {
        return new Channel('company.' . $this->appointment->company_id . '.appointments');
    }

    public function broadcastAs(): string
    {
        return 'AppointmentChanged';
    }

    public function broadcastWith(): array
    {
        $a = $this->appointment;
        return [
            'id'         => $a->id,
            'status'     => $a->status,
            'starts_at'  => $a->starts_at,
            'ends_at'    => $a->ends_at,
            'price'      => $a->price,
            'notes'      => $a->notes,
            'barber'     => $a->barber ? ['id' => $a->barber->id, 'user' => ['name' => $a->barber->user?->name]] : null,
            'customer'   => $a->customer ? ['id' => $a->customer->id, 'name' => $a->customer->name, 'phone' => $a->customer->phone] : null,
            'service'    => $a->service ? ['id' => $a->service->id, 'name' => $a->service->name] : null,
            'services'   => $a->services->map(fn($s) => ['id' => $s->id, 'name' => $s->name])->values(),
            'company_id' => $a->company_id,
            'canEdit'    => true,
            'canDelete'  => true,
        ];
    }
}
