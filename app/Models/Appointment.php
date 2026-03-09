<?php

namespace App\Models;

use App\Models\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Appointment extends Model
{
    use HasFactory, BelongsToCompany;

    protected $fillable = [
        'company_id',
        'barber_id',
        'customer_id',
        'service_id',
        'starts_at',
        'ends_at',
        'status',
        'booking_source',
        'notes',
        'price',
        'tip_amount',
        'recurrence_rule',
        'recurrence_parent_id',
        'cancel_token',
        'cancel_token_expires_at',
    ];

    protected function casts(): array
    {
        return [
            'starts_at'               => 'datetime',
            'ends_at'                 => 'datetime',
            'cancel_token_expires_at' => 'datetime',
            'price'                   => 'integer',
            'tip_amount'              => 'integer',
        ];
    }

    public function barber(): BelongsTo
    {
        return $this->belongsTo(Barber::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }

    public function review(): HasOne
    {
        return $this->hasOne(Review::class);
    }

    public function barberNotes(): HasMany
    {
        return $this->hasMany(BarberNote::class);
    }

    public function products(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'appointment_products')
            ->withPivot(['qty', 'unit_price'])
            ->withTimestamps();
    }
}
