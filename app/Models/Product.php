<?php

namespace App\Models;

use App\Models\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, BelongsToCompany, SoftDeletes;

    protected $fillable = ['company_id', 'name', 'category', 'price', 'stock_qty', 'low_stock_threshold', 'is_active'];

    protected function casts(): array
    {
        return [
            'price'               => 'integer',
            'stock_qty'           => 'integer',
            'low_stock_threshold' => 'integer',
            'is_active'           => 'boolean',
        ];
    }

    public function appointments(): BelongsToMany
    {
        return $this->belongsToMany(Appointment::class, 'appointment_products')
            ->withPivot(['qty', 'unit_price'])
            ->withTimestamps();
    }
}
