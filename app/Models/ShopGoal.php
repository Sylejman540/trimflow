<?php

namespace App\Models;

use App\Models\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShopGoal extends Model
{
    use HasFactory, BelongsToCompany;

    protected $fillable = [
        'company_id',
        'month',
        'year',
        'revenue_target',
        'bookings_target',
    ];

    protected function casts(): array
    {
        return [
            'revenue_target'  => 'integer',
            'bookings_target' => 'integer',
        ];
    }
}
