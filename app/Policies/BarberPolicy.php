<?php

namespace App\Policies;

use App\Models\Barber;
use App\Models\User;

class BarberPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasRole('shop-admin');
    }

    public function create(User $user): bool
    {
        return $user->hasRole('shop-admin');
    }

    public function update(User $user, Barber $barber): bool
    {
        if ($user->hasRole('shop-admin')) {
            return true;
        }

        // Barbers can edit their own profile
        return $user->hasRole('barber') && $user->barber && $barber->id === $user->barber->id;
    }

    public function delete(User $user): bool
    {
        return $user->hasRole('shop-admin');
    }
}
