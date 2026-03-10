<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Barber;
use App\Models\Product;
use App\Models\Service;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __invoke()
    {
        $user = Auth::user();

        if ($user->hasRole('platform-admin')) {
            return redirect()->route('admin.dashboard');
        }

        $today    = Carbon::today();
        $isBarber = $user->hasRole('barber') && !$user->hasRole('shop-admin');
        $barberId = $isBarber ? $user->barber?->id : null;

        $appointmentQuery = fn () => Appointment::query()
            ->when($barberId, fn ($q) => $q->where('barber_id', $barberId));

        $stats = [
            'today_appointments' => $appointmentQuery()
                ->whereDate('starts_at', $today)
                ->whereNotIn('status', ['cancelled'])
                ->count(),
            'today_pending' => $appointmentQuery()
                ->whereDate('starts_at', $today)
                ->where('status', 'pending')
                ->count(),
            'today_revenue' => (int) $appointmentQuery()
                ->whereDate('starts_at', $today)
                ->where('status', 'completed')
                ->sum('price'),
            'completion_rate' => 0,
        ];

        // Today's schedule
        $todaySchedule = $appointmentQuery()
            ->with(['barber.user', 'customer', 'service'])
            ->whereDate('starts_at', $today)
            ->whereNotIn('status', ['cancelled'])
            ->orderBy('starts_at')
            ->get()
            ->each(fn (Appointment $a) => $a->resolveStatus())
            ->map(fn (Appointment $a) => $this->mapAppointment($a));

        // Low-stock products alert (admin only)
        $lowStockProducts = $isBarber ? [] : Product::where('is_active', true)
            ->whereColumn('stock_qty', '<=', 'low_stock_threshold')
            ->orderBy('stock_qty')
            ->get(['id', 'name', 'stock_qty', 'low_stock_threshold'])
            ->toArray();

        // Getting started checklist (admin only)
        $setup = null;
        if (!$isBarber) {
            $company = $user->company;
            $hasBarbers  = Barber::where('company_id', $company->id)->where('is_active', true)->exists();
            $hasServices = Service::where('company_id', $company->id)->where('is_active', true)->exists();
            $hasInfo     = !empty($company->phone) || !empty($company->address);
            $setup = [
                'shop_info'    => $hasInfo,
                'has_barbers'  => $hasBarbers,
                'has_services' => $hasServices,
                'booking_link' => route('booking.show', $company->slug),
                'all_done'     => $hasInfo && $hasBarbers && $hasServices,
            ];
        }

        return Inertia::render('Dashboard', [
            'is_barber'          => $isBarber,
            'low_stock_products' => $lowStockProducts,
            'setup'              => $setup,
            'stats'              => $stats,
            'today_schedule'     => $todaySchedule,
            'upcoming_appointments' => $appointmentQuery()
                ->with(['barber.user', 'customer', 'service'])
                ->where('ends_at', '>=', now())
                ->whereNotIn('status', ['completed', 'cancelled', 'no_show'])
                ->orderBy('starts_at')
                ->limit(8)
                ->get()
                ->each(fn (Appointment $a) => $a->resolveStatus())
                ->map(fn (Appointment $a) => $this->mapAppointment($a)),
        ]);
    }

    private function mapAppointment(Appointment $a): array
    {
        return [
            'id'        => $a->id,
            'starts_at' => $a->starts_at->toIso8601String(),
            'ends_at'   => $a->ends_at->toIso8601String(),
            'status'    => $a->status,
            'price'     => $a->price,
            'notes'     => $a->notes,
            'customer'  => $a->customer ? ['id' => $a->customer->id, 'name' => $a->customer->name] : null,
            'service'   => $a->service  ? ['id' => $a->service->id,  'name' => $a->service->name]  : null,
            'barber'    => $a->barber   ? ['id' => $a->barber->id,   'user' => ['name' => $a->barber->user?->name]] : null,
        ];
    }
}
