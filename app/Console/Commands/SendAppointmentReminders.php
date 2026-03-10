<?php

namespace App\Console\Commands;

use App\Models\Appointment;
use App\Notifications\AppointmentReminder;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class SendAppointmentReminders extends Command
{
    protected $signature = 'reminders:send
                            {--window=60 : Minutes before appointment to send reminder (default: 60)}';

    protected $description = 'Send SMS/email reminders to customers with upcoming appointments';

    public function handle(): int
    {
        $windowMinutes = (int) $this->option('window');

        // Find appointments starting within the next window ± 5 min (avoids duplicates from overlapping cron runs)
        $from = now()->addMinutes($windowMinutes - 5);
        $to   = now()->addMinutes($windowMinutes + 5);

        $appointments = Appointment::with(['customer', 'barber.user', 'service', 'company'])
            ->whereIn('status', ['confirmed', 'pending'])
            ->whereBetween('starts_at', [$from, $to])
            ->whereNull('reminder_sent_at')
            ->get();

        if ($appointments->isEmpty()) {
            $this->info('No reminders to send.');
            return self::SUCCESS;
        }

        $sent = 0;

        foreach ($appointments as $appointment) {
            $customer = $appointment->customer;

            if (! $customer) {
                continue;
            }

            try {
                $customer->notify(new AppointmentReminder($appointment));

                // Mark as sent so we don't double-send
                $appointment->updateQuietly(['reminder_sent_at' => now()]);

                $sent++;
                $this->line("  ✓ Reminder sent to {$customer->name} ({$customer->phone})");
            } catch (\Throwable $e) {
                Log::error('Failed to send appointment reminder', [
                    'appointment_id' => $appointment->id,
                    'customer_id'    => $customer->id,
                    'error'          => $e->getMessage(),
                ]);
                $this->error("  ✗ Failed for {$customer->name}: {$e->getMessage()}");
            }
        }

        $this->info("Sent {$sent} reminder(s).");

        return self::SUCCESS;
    }
}
