<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class MarqueeSponsor extends Model
{
    protected $fillable = [
        'shop_name',
        'url',
        'amount_paid',
        'active_until',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active'    => 'boolean',
            'active_until' => 'datetime',
            'amount_paid'  => 'integer',
        ];
    }

    /**
     * Scope: only sponsors that are active and not expired.
     */
    public function scopeVisible(Builder $query): void
    {
        $query->where('is_active', true)
              ->where(function (Builder $q) {
                  $q->whereNull('active_until')
                    ->orWhere('active_until', '>', now());
              });
    }
}
