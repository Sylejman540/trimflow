<?php

namespace App\Http\Requests;

use App\Rules\ValidPhone;
use Illuminate\Foundation\Http\FormRequest;

class StorePublicBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'barber_id'             => 'required|exists:barbers,id',
            'service_ids'           => 'required|array|min:1',
            'service_ids.*'         => 'integer|exists:services,id',
            'starts_at'             => 'required|date|after:now|before:' . now()->addDays(60)->toDateTimeString(),
            'customer_name'         => 'required|string|max:255',
            'customer_phone'        => ['nullable', 'string', 'max:30', new ValidPhone()],
            'notes'                 => 'nullable|string|max:1000',
            '_t'                    => 'nullable|integer',
            'cf_turnstile_response' => 'nullable|string',
            'recaptcha_token'       => 'nullable|string',
        ];
    }

    protected function prepareForValidation(): void
    {
        // Sanitize customer name and notes: strip HTML tags and trim whitespace
        $this->merge([
            'customer_name' => trim(strip_tags($this->input('customer_name', ''))),
            'notes' => $this->input('notes') ? trim(strip_tags($this->input('notes', ''))) : null,
        ]);
    }
}
