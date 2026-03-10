<?php

namespace App\Policies;

use App\Models\Customer;
use App\Models\User;

class CustomerPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['shop-admin', 'barber']);
    }

    public function view(User $user, Customer $customer): bool
    {
        return $user->company_id === $customer->company_id
            && $user->hasAnyRole(['shop-admin', 'barber']);
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['shop-admin', 'barber']);
    }

    public function update(User $user, Customer $customer): bool
    {
        return $user->company_id === $customer->company_id
            && $user->hasAnyRole(['shop-admin', 'barber']);
    }

    public function delete(User $user, Customer $customer): bool
    {
        return $user->company_id === $customer->company_id
            && $user->hasRole('shop-admin');
    }
}
