<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, HasRoles, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'company_id',
        'language',
        'notifications_sound',
        'notifications_email',
        'google_id',
        'google_token',
        'email_verification_code',
        'email_verification_code_expires_at',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function barber(): HasOne
    {
        return $this->hasOne(Barber::class);
    }

    public function customer(): HasOne
    {
        return $this->hasOne(Customer::class);
    }

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'email_verification_code_expires_at' => 'datetime',
            'password' => 'hashed',
            'notifications_sound' => 'boolean',
            'notifications_email' => 'boolean',
        ];
    }

    /**
     * Generate a new email verification code.
     */
    public function generateVerificationCode(): string
    {
        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $this->update([
            'email_verification_code' => $code,
            'email_verification_code_expires_at' => now()->addMinutes(10),
        ]);
        return $code;
    }

    /**
     * Check if the verification code is valid.
     */
    public function isVerificationCodeValid(string $code): bool
    {
        return $this->email_verification_code === $code
            && $this->email_verification_code_expires_at
            && $this->email_verification_code_expires_at->isFuture();
    }

    /**
     * Clear the verification code.
     */
    public function clearVerificationCode(): void
    {
        $this->update([
            'email_verification_code' => null,
            'email_verification_code_expires_at' => null,
        ]);
    }
}
