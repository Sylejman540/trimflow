<?php

namespace App\Services;

use App\Models\Appointment;
use Illuminate\Support\Carbon;

class RecurrenceService
{
    public static function generateChildren(Appointment $parent, int $count = 8): void
    {
        if ($parent->recurrence_rule === 'none' || !$parent->recurrence_rule) {
            return;
        }

        $current = $parent->starts_at->copy();
        $duration = $parent->starts_at->diffInMinutes($parent->ends_at);

        for ($i = 0; $i < $count; $i++) {
            $current = match ($parent->recurrence_rule) {
                'weekly'   => $current->copy()->addWeek(),
                'biweekly' => $current->copy()->addWeeks(2),
                'monthly'  => $current->copy()->addMonth(),
                default    => null,
            };

            if (!$current) break;

            $childEnd = $current->copy()->addMinutes($duration);

            // Skip if barber already has a conflicting appointment
            $conflict = Appointment::where('barber_id', $parent->barber_id)
                ->whereNotIn('status', ['cancelled', 'no_show'])
                ->where('starts_at', '<', $childEnd)
                ->where('ends_at', '>', $current)
                ->exists();

            if ($conflict) continue;

            $child = Appointment::create([
                'company_id'           => $parent->company_id,
                'barber_id'            => $parent->barber_id,
                'customer_id'          => $parent->customer_id,
                'service_id'           => $parent->service_id,
                'starts_at'            => $current->copy(),
                'ends_at'              => $childEnd,
                'price'                => $parent->price,
                'status'               => 'confirmed',
                'notes'                => $parent->notes,
                'recurrence_rule'      => $parent->recurrence_rule,
                'recurrence_parent_id' => $parent->id,
            ]);

            // Copy services pivot from parent
            $pivotData = $parent->services->mapWithKeys(fn ($s) => [
                $s->id => ['price' => $s->pivot->price, 'duration' => $s->pivot->duration],
            ])->all();
            if ($pivotData) {
                $child->services()->attach($pivotData);
            }
        }
    }

    public static function deleteFuture(Appointment $appointment): void
    {
        $parentId = $appointment->recurrence_parent_id ?? $appointment->id;

        Appointment::where(function ($q) use ($parentId) {
            $q->where('recurrence_parent_id', $parentId)
              ->orWhere('id', $parentId);
        })
        ->where('starts_at', '>=', $appointment->starts_at)
        ->where('id', '!=', $appointment->id)
        ->delete();
    }
}
