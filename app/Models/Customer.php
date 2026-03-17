<?php

namespace App\Models;

use App\Models\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Customer extends Model
{
    use HasFactory, BelongsToCompany, SoftDeletes;

    protected $fillable = [
        'company_id',
        'user_id',
        'name',
        'email',
        'phone',
        'address',
        'notes',
        'favorite_barber_id',
        'loyalty_points',
        'last_visit_at',
        'booking_no_shows',
        'booking_total',
        'booking_trust',
    ];

    protected function casts(): array
    {
        return [
            'last_visit_at' => 'datetime',
        ];
    }

    public function loyaltyTier(): string
    {
        return match (true) {
            $this->loyalty_points >= 500 => 'Gold',
            $this->loyalty_points >= 200 => 'Silver',
            $this->loyalty_points >= 50  => 'Bronze',
            default                      => 'Member',
        };
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function favoriteBarber(): BelongsTo
    {
        return $this->belongsTo(Barber::class, 'favorite_barber_id');
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }
}
