<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Barber;
use App\Models\Customer;
use App\Models\Service;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SearchController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $q = trim($request->get('q', ''));

        if (strlen($q) < 2) {
            return response()->json(['customers' => [], 'appointments' => [], 'services' => [], 'barbers' => []]);
        }

        $like = "%{$q}%";
        $companyId = Auth::user()->company_id;

        $customers = Customer::where('company_id', $companyId)
            ->where(fn ($query) => $query->where('name', 'LIKE', $like)->orWhere('phone', 'LIKE', $like))
            ->limit(5)
            ->get(['id', 'name', 'phone'])
            ->map(fn ($c) => [
                'id'       => $c->id,
                'label'    => $c->name,
                'subtitle' => $c->phone ?? '',
                'url'      => route('customers.show', $c->id),
                'type'     => 'customer',
            ]);

        $appointments = Appointment::with(['customer', 'service'])
            ->where('company_id', $companyId)
            ->where(fn ($query) => $query
                ->whereHas('customer', fn ($q2) => $q2->where('name', 'LIKE', $like))
                ->orWhereHas('service', fn ($q2) => $q2->where('name', 'LIKE', $like))
            )
            ->orderByDesc('starts_at')
            ->limit(5)
            ->get()
            ->map(fn ($a) => [
                'id'       => $a->id,
                'label'    => $a->customer?->name ?? 'Unknown',
                'subtitle' => ($a->service?->name ?? '') . ' · ' . $a->starts_at->format('M j, g:i A'),
                'url'      => route('appointments.show', $a->id),
                'type'     => 'appointment',
            ]);

        $services = Service::where('company_id', $companyId)
            ->where('name', 'LIKE', $like)
            ->limit(5)
            ->get(['id', 'name', 'price'])
            ->map(fn ($s) => [
                'id'       => $s->id,
                'label'    => $s->name,
                'subtitle' => '$' . number_format($s->price / 100, 2),
                'url'      => route('services.edit', $s->id),
                'type'     => 'service',
            ]);

        $barbers = Barber::with('user')
            ->where('company_id', $companyId)
            ->whereHas('user', fn ($q2) => $q2->where('name', 'LIKE', $like))
            ->limit(5)
            ->get()
            ->map(fn ($b) => [
                'id'       => $b->id,
                'label'    => $b->user?->name ?? '',
                'subtitle' => $b->specialty ?? '',
                'url'      => route('barbers.edit', $b->id),
                'type'     => 'barber',
            ]);

        return response()->json(compact('customers', 'appointments', 'services', 'barbers'));
    }
}
