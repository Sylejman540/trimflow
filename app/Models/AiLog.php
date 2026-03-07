<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiLog extends Model
{
    protected $fillable = [
        'user_id',
        'company_id',
        'provider',
        'prompt',
        'response',
        'tokens_used',
        'latency',
    ];

    protected function casts(): array
    {
        return [
            'tokens_used' => 'integer',
            'latency' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }
}
