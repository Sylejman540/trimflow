<?php

namespace App\Policies;

use App\Models\Appointment;
use App\Models\User;

class AppointmentPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Appointment $appointment): bool
    {
        if ($user->hasRole('shop-admin')) {
            return true;
        }

        return $user->barber && $appointment->barber_id === $user->barber->id;
    }

    public function create(User $user): bool
    {
        return $user->hasRole('shop-admin') || $user->hasRole('barber');
    }

    public function update(User $user, Appointment $appointment): bool
    {
        if ($user->hasRole('shop-admin')) {
            return true;
        }

        // Barbers can only update appointments they created (assigned to them)
        return $user->hasRole('barber') && $user->barber && $appointment->barber_id === $user->barber->id;
    }

    public function delete(User $user, Appointment $appointment): bool
    {
        return $user->hasRole('shop-admin');
    }
}
