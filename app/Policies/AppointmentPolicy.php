<?php

namespace App\Policies;

use App\Models\Appointment;
use App\Models\User;

class AppointmentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['shop-admin', 'barber', 'platform-admin']);
    }

    public function view(User $user, Appointment $appointment): bool
    {
        // Must belong to the same company
        if ($user->company_id !== $appointment->company_id) {
            return false;
        }

        if ($user->hasAnyRole(['shop-admin', 'platform-admin'])) {
            return true;
        }

        return $user->hasRole('barber') && $user->barber
            && $appointment->barber_id === $user->barber->id;
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['shop-admin', 'barber', 'platform-admin']);
    }

    public function update(User $user, Appointment $appointment): bool
    {
        if ($user->company_id !== $appointment->company_id) {
            return false;
        }

        if ($user->hasAnyRole(['shop-admin', 'platform-admin'])) {
            return true;
        }

        return $user->hasRole('barber') && $user->barber
            && $appointment->barber_id === $user->barber->id;
    }

    public function delete(User $user, Appointment $appointment): bool
    {
        if ($user->company_id !== $appointment->company_id) {
            return false;
        }

        if ($appointment->starts_at->isPast()) {
            return false;
        }

        return $user->hasAnyRole(['shop-admin', 'platform-admin']);
    }
}
