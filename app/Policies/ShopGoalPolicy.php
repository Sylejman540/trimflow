<?php

namespace App\Policies;

use App\Models\ShopGoal;
use App\Models\User;

class ShopGoalPolicy
{
    public function create(User $user): bool
    {
        return $user->hasAnyRole(['platform-admin', 'shop-admin']);
    }
}
