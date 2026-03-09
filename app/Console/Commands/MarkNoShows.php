<?php

namespace App\Console\Commands;

use App\Models\Appointment;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class MarkNoShows extends Command
{
    protected $signature   = 'appointments:mark-no-shows';
    protected $description = 'Mark scheduled/confirmed appointments that have passed as no_show';

    public function handle(): int
    {
        $cutoff = Carbon::now()->subMinutes(30);

        $updated = Appointment::whereIn('status', ['scheduled', 'confirmed'])
            ->where('ends_at', '<', $cutoff)
            ->update(['status' => 'no_show']);

        $this->info("Marked {$updated} appointment(s) as no_show.");

        return self::SUCCESS;
    }
}
