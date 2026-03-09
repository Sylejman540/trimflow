<?php

namespace App\Console\Commands;

use App\Models\Appointment;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class AutoStatusAppointments extends Command
{
    protected $signature   = 'appointments:auto-status';
    protected $description = 'Mark appointments as in_progress or completed based on current time';

    public function handle(): int
    {
        $now = Carbon::now();

        // Mark as in_progress: scheduled/confirmed appointments that have started but not ended
        $inProgress = Appointment::whereIn('status', ['scheduled', 'confirmed'])
            ->where('starts_at', '<=', $now)
            ->where('ends_at', '>', $now)
            ->update(['status' => 'in_progress']);

        // Mark as completed: in_progress appointments whose ends_at has passed
        $completed = Appointment::where('status', 'in_progress')
            ->where('ends_at', '<=', $now)
            ->update(['status' => 'completed']);

        $this->info("Marked {$inProgress} appointment(s) as in_progress, {$completed} as completed.");

        return self::SUCCESS;
    }
}
