<?php

namespace App\Notifications;

use App\Models\Company;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Collection;

class DailyDigest extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly Company    $company,
        public readonly Collection $appointments
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $count    = $this->appointments->count();
        $tomorrow = $this->appointments->first()?->starts_at->format('l, F j') ?? 'tomorrow';

        $mail = (new MailMessage)
            ->subject("Tomorrow's Schedule — {$count} " . str('appointment')->plural($count) . " at {$this->company->name}")
            ->greeting("Hi {$notifiable->name},")
            ->line("Here's a summary of tomorrow's bookings ({$tomorrow}) at **{$this->company->name}**:");

        foreach ($this->appointments as $appt) {
            $time     = $appt->starts_at->format('g:i A');
            $customer = $appt->customer?->name ?? 'Unknown';
            $barber   = $appt->barber?->user?->name ?? '—';
            $service  = $appt->service?->name ?? '—';
            $mail->line("• **{$time}** — {$customer} with {$barber} ({$service})");
        }

        return $mail
            ->action('View Dashboard', url(route('dashboard')))
            ->salutation('Have a great day!');
    }
}
