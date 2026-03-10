<?php

namespace App\Providers;

use App\Models\Appointment;
use App\Models\Barber;
use App\Models\Customer;
use App\Models\Service;
use App\Observers\AuditObserver;
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
    }
}
