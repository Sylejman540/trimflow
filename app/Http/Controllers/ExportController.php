<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExportController extends Controller
{
    public function appointments(Request $request): StreamedResponse
    {
        $this->authorize('viewAny', Appointment::class);

        $query = Appointment::with(['barber.user', 'customer', 'service'])
            ->orderBy('starts_at', 'desc');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $appointments = $query->get();

        return response()->streamDownload(function () use ($appointments) {
            $out = fopen('php://output', 'w');

            fputcsv($out, ['ID', 'Date', 'Customer', 'Phone', 'Barber', 'Service', 'Price', 'Status', 'Notes']);

            foreach ($appointments as $a) {
                fputcsv($out, [
                    $a->id,
                    $a->starts_at->format('Y-m-d H:i'),
                    $a->customer?->name ?? '',
                    $a->customer?->phone ?? '',
                    $a->barber?->user?->name ?? '',
                    $a->service?->name ?? '',
                    number_format($a->price / 100, 2),
                    $a->status,
                    $a->notes ?? '',
                ]);
            }

            fclose($out);
        }, 'appointments-' . now()->format('Y-m-d') . '.csv', [
            'Content-Type' => 'text/csv',
        ]);
    }

    public function customers(): StreamedResponse
    {
        $this->authorize('viewAny', Appointment::class);

        $customers = Customer::with('favoriteBarber.user')
            ->withCount(['appointments as visit_count' => fn ($q) => $q->where('status', 'completed')])
            ->orderBy('name')
            ->get();

        return response()->streamDownload(function () use ($customers) {
            $out = fopen('php://output', 'w');

            fputcsv($out, ['ID', 'Name', 'Email', 'Phone', 'Favorite Barber', 'Visits', 'Loyalty Points', 'Loyalty Tier', 'Last Visit', 'Notes', 'Joined']);

            foreach ($customers as $c) {
                fputcsv($out, [
                    $c->id,
                    $c->name,
                    $c->email ?? '',
                    $c->phone ?? '',
                    $c->favoriteBarber?->user?->name ?? '',
                    $c->visit_count,
                    $c->loyalty_points,
                    $c->loyaltyTier(),
                    $c->last_visit_at?->format('Y-m-d') ?? '',
                    $c->notes ?? '',
                    $c->created_at->format('Y-m-d'),
                ]);
            }

            fclose($out);
        }, 'customers-' . now()->format('Y-m-d') . '.csv', [
            'Content-Type' => 'text/csv',
        ]);
    }
}
