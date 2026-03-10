<?php

namespace App\Policies;

use App\Models\Product;
use App\Models\User;

class ProductPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['shop-admin', 'barber']);
    }

    public function create(User $user): bool
    {
        return $user->hasRole('shop-admin');
    }

    public function update(User $user, Product $product): bool
    {
        return $user->company_id === $product->company_id
            && $user->hasRole('shop-admin');
    }

    public function delete(User $user, Product $product): bool
    {
        return $user->company_id === $product->company_id
            && $user->hasRole('shop-admin');
    }
}
