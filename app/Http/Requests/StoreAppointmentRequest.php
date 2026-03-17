<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAppointmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $isBarber = $this->user()->hasRole('barber') && !$this->user()->hasRole('shop-admin');

        return [
            'barber_id'       => $isBarber ? 'nullable' : 'required|exists:barbers,id',
            'customer_name'   => 'required|string|max:255',
            'customer_phone'  => 'nullable|string|max:50',
            'customer_email'  => 'nullable|email|max:255',
            'service_ids'     => 'required|array|min:1',
            'service_ids.*'   => 'integer|exists:services,id',
            'starts_at'       => 'required|date',
            'notes'           => 'nullable|string|max:1000',
            'recurrence_rule' => 'nullable|in:none,weekly,biweekly,monthly',
        ];
    }

    public function messages(): array
    {
        return [
            'service_ids.required' => 'Please select at least one service.',
            'service_ids.min' => 'Please select at least one service.',
            'starts_at.required' => 'The starts at field is required.',
            'barber_id.required' => 'Please select a barber.',
            'customer_name.required' => 'Customer name is required.',
        ];
    }

    protected function prepareForValidation(): void
    {
        // Sanitize customer name: strip HTML tags and trim whitespace
        $this->merge([
            'customer_name' => trim(strip_tags($this->input('customer_name', ''))),
            'notes' => $this->input('notes') ? trim(strip_tags($this->input('notes', ''))) : null,
        ]);
    }
}
