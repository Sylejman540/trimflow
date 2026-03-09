<?php

namespace App\Console\Commands;

use App\Models\Appointment;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class GenerateRecurringAppointments extends Command
{
    protected $signature   = 'appointments:generate-recurring';
    protected $description = 'Generate next occurrence for completed recurring appointments that have no future child';

    public function handle(): int
    {
        $recurring = Appointment::where('recurrence_rule', '!=', 'none')
            ->where('status', 'completed')
            ->whereNull('recurrence_parent_id') // only root appointments
            ->get();

        $created = 0;

        foreach ($recurring as $appt) {
            $alreadyExists = Appointment::where('recurrence_parent_id', $appt->id)
                ->where('starts_at', '>', now())
                ->exists();

            if ($alreadyExists) continue;

            $nextStart = $this->nextDate($appt->starts_at, $appt->recurrence_rule);
            $duration  = $appt->starts_at->diffInMinutes($appt->ends_at);

            Appointment::create([
                'company_id'           => $appt->company_id,
                'barber_id'            => $appt->barber_id,
                'customer_id'          => $appt->customer_id,
                'service_id'           => $appt->service_id,
                'starts_at'            => $nextStart,
                'ends_at'              => $nextStart->copy()->addMinutes($duration),
                'status'               => 'scheduled',
                'price'                => $appt->price,
                'notes'                => $appt->notes,
                'recurrence_rule'      => $appt->recurrence_rule,
                'recurrence_parent_id' => $appt->id,
            ]);

            $created++;
        }

        $this->info("Generated {$created} recurring appointment(s).");

        return self::SUCCESS;
    }

    private function nextDate(Carbon $from, string $rule): Carbon
    {
        return match ($rule) {
            'weekly'   => $from->copy()->addWeek(),
            'biweekly' => $from->copy()->addWeeks(2),
            'monthly'  => $from->copy()->addMonth(),
            default    => $from->copy()->addWeek(),
        };
    }
}
