<?php

namespace App\Rules;

use Illuminate\Contracts\Validation\ValidationRule;

class ValidPhone implements ValidationRule
{
    public function validate(string $attribute, mixed $value, \Closure $fail): void
    {
        // Remove all non-digit and non-plus characters
        $phone = preg_replace('/[^\d+]/', '', $value ?? '');

        // Must have at least 7 digits (minimum for valid phone numbers)
        if (strlen(preg_replace('/\D/', '', $phone)) < 7) {
            $fail(trans('booking.errorInvalidPhone'));
            return;
        }

        // If starts with +, must be international format with 1-3 digit country code
        if (preg_match('/^\+/', $phone)) {
            if (!preg_match('/^\+\d{1,3}\d{6,14}$/', $phone)) {
                $fail(trans('booking.errorInvalidPhone'));
                return;
            }
        } else {
            // Local format: at least 7 digits, at most 15
            if (!preg_match('/^\d{7,15}$/', $phone)) {
                $fail(trans('booking.errorInvalidPhone'));
                return;
            }
        }
    }
}
