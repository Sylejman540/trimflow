<?php

namespace App\Models;

use App\Models\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Barber extends Model
{
    use HasFactory, BelongsToCompany;

    protected $fillable = [
        'company_id',
        'user_id',
        'specialty',
        'bio',
        'avatar',
        'working_hours',
        'is_active',
        'google_access_token',
        'google_refresh_token',
        'google_token_expires_at',
        'google_calendar_enabled',
    ];

    protected function casts(): array
    {
        return [
            'working_hours'           => 'array',
            'is_active'               => 'boolean',
            'google_token_expires_at' => 'datetime',
            'google_calendar_enabled' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function notes(): HasMany
    {
        return $this->hasMany(BarberNote::class);
    }
}
