<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Company;
use Illuminate\Http\Request;

class BookingApiController extends Controller
{
    public function status(string $slug, string $token)
    {
        $company = Company::where('slug', $slug)->where('is_active', true)->firstOrFail();

        $appointment = Appointment::with(['barber.user', 'services', 'customer'])
            ->where('cancel_token', $token)
            ->where('company_id', $company->id)
            ->firstOrFail();

        return response()->json([
            'appointment' => [
                'id'       => $appointment->id,
                'status'   => $appointment->status,
                'starts_at'=> $appointment->starts_at->toIso8601String(),
                'barber'   => $appointment->barber?->user?->name,
                'services' => $appointment->services->pluck('name')->join(', '),
                'price'    => $appointment->price,
            ],
        ]);
    }
}
