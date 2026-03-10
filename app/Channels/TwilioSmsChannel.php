<?php

namespace App\Channels;

use Illuminate\Notifications\Notification;
use Twilio\Rest\Client as TwilioClient;

class TwilioSmsChannel
{
    public function send(object $notifiable, Notification $notification): void
    {
        if (! method_exists($notification, 'toTwilioSms')) {
            return;
        }

        $message = $notification->toTwilioSms($notifiable);

        if (! $message || empty($notifiable->phone)) {
            return;
        }

        $twilio = new TwilioClient(
            config('services.twilio.sid'),
            config('services.twilio.token'),
        );

        $twilio->messages->create($notifiable->phone, [
            'from' => config('services.twilio.from'),
            'body' => $message,
        ]);
    }
}
