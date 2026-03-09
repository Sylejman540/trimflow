<?php

namespace App\Jobs;

use App\Models\Appointment;
use App\Models\Company;
use App\Models\User;
use App\Notifications\DailyDigest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Carbon;

class SendDailyDigest implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public readonly Company $company) {}

    public function handle(): void
    {
        $tz       = $this->company->timezone ?: config('app.timezone');
        $tomorrow = Carbon::now($tz)->addDay()->startOfDay();

        $appointments = Appointment::with(['barber.user', 'customer', 'service'])
            ->where('company_id', $this->company->id)
            ->whereDate('starts_at', $tomorrow->toDateString())
            ->whereNotIn('status', ['cancelled', 'no_show'])
            ->orderBy('starts_at')
            ->get();

        if ($appointments->isEmpty()) {
            return;
        }

        User::where('company_id', $this->company->id)
            ->whereHas('roles', fn($q) => $q->where('name', 'shop-admin'))
            ->each(fn(User $owner) => $owner->notify(new DailyDigest($this->company, $appointments)));
    }
}
