<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class PruneOldNotifications extends Command
{
    protected $signature   = 'notifications:prune {--days=7 : Delete notifications older than this many days}';
    protected $description = 'Delete database notifications older than N days';

    public function handle(): int
    {
        $days    = (int) $this->option('days');
        $deleted = DB::table('notifications')
            ->where('created_at', '<', now()->subDays($days))
            ->delete();

        $this->info("Pruned {$deleted} notification(s) older than {$days} days.");

        return self::SUCCESS;
    }
}
