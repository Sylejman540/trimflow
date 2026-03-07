<?php

namespace App\Policies;

use App\Models\User;

class ServicePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasRole('shop-admin');
    }

    public function create(User $user): bool
    {
        return $user->hasRole('shop-admin');
    }

    public function update(User $user): bool
    {
        return $user->hasRole('shop-admin');
    }

    public function delete(User $user): bool
    {
        return $user->hasRole('shop-admin');
    }
}
