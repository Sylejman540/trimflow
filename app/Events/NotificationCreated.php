<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NotificationCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly int $company_id,
        public readonly int $user_id,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new Channel("company.{$this->company_id}.appointments"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'NotificationCreated';
    }
}
