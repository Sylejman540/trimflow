<?php

use App\Jobs\SendAppointmentReminders;
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

// Generate next occurrences for completed recurring appointments daily
Schedule::command('appointments:generate-recurring')->daily();
