<?php

use App\Jobs\SendAppointmentReminders;
use App\Jobs\SendDailyDigest;
use App\Jobs\SendLowStockAlerts;
use App\Models\Company;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Send 24-hour reminder emails every hour
Schedule::job(new SendAppointmentReminders)->hourly();

// Auto-mark no-shows every 30 minutes
Schedule::command('appointments:mark-no-shows')->everyThirtyMinutes();

// Auto-transition in_progress / completed every minute
Schedule::command('appointments:auto-status')->everyMinute();

// Generate next occurrences for completed recurring appointments daily
Schedule::command('appointments:generate-recurring')->daily();

// Prune notifications older than 7 days (runs nightly)
Schedule::command('notifications:prune')->daily();

// Send daily digest to all active companies at 8 PM
Schedule::call(function () {
    Company::where('is_active', true)->each(fn($c) => SendDailyDigest::dispatch($c));
})->dailyAt('20:00');

// Check low stock every morning at 9 AM
Schedule::call(function () {
    Company::where('is_active', true)->each(fn($c) => SendLowStockAlerts::dispatch($c));
})->dailyAt('09:00');
