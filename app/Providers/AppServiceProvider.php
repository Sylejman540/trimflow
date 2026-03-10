<?php

namespace App\Providers;

use App\Channels\TwilioSmsChannel;
use App\Models\Appointment;
use App\Models\Barber;
use App\Models\Customer;
use App\Models\Service;
use App\Observers\AuditObserver;
use Illuminate\Notifications\ChannelManager;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        Appointment::observe(AuditObserver::class);
        Barber::observe(AuditObserver::class);
        Customer::observe(AuditObserver::class);
        Service::observe(AuditObserver::class);

        // Register custom Twilio SMS notification channel
        Notification::extend('twilio_sms', fn (/** @var \Illuminate\Contracts\Foundation\Application $app */ $app) => new TwilioSmsChannel());
    }
}
