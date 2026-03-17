<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Barber;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Service;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
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
        $isOwnerBarber = $user->hasRole('shop-admin') && $user->hasRole('barber') && $user->barber;
        // Plain barbers see only their own appointments; owner-barbers see the whole shop
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
            ->limit(50)
            ->get()
            ->each(fn (Appointment $a) => $a->resolveStatus())
            ->map(fn (Appointment $a) => $this->mapAppointment($a));

        // Owner-barber personal data (their own appointments only)
        $myStats = null;
        $myTodaySchedule = null;
        $myUpcoming = null;
        if ($isOwnerBarber) {
            $myBarberId = $user->barber->id;
            $myQuery = fn () => Appointment::query()->where('barber_id', $myBarberId);
            $myStats = [
                'today_appointments' => $myQuery()->whereDate('starts_at', $today)->whereNotIn('status', ['cancelled'])->count(),
                'today_pending'      => $myQuery()->whereDate('starts_at', $today)->where('status', 'pending')->count(),
                'today_revenue'      => (int) $myQuery()->whereDate('starts_at', $today)->where('status', 'completed')->sum('price'),
                'completion_rate'    => 0,
            ];
            $myTodaySchedule = $myQuery()
                ->with(['barber.user', 'customer', 'service'])
                ->whereDate('starts_at', $today)
                ->whereNotIn('status', ['cancelled'])
                ->orderBy('starts_at')
                ->limit(50)
                ->get()
                ->each(fn (Appointment $a) => $a->resolveStatus())
                ->map(fn (Appointment $a) => $this->mapAppointment($a));
            $myUpcoming = $myQuery()
                ->with(['barber.user', 'customer', 'service'])
                ->where('ends_at', '>=', now())
                ->whereNotIn('status', ['completed', 'cancelled', 'no_show'])
                ->orderBy('starts_at')
                ->limit(8)
                ->get()
                ->each(fn (Appointment $a) => $a->resolveStatus())
                ->map(fn (Appointment $a) => $this->mapAppointment($a));
        }

        // Low-stock products alert (admin only, not plain barbers)
        $lowStockProducts = ($isBarber && !$isOwnerBarber) ? [] : Product::where('is_active', true)
            ->whereColumn('stock_qty', '<=', 'low_stock_threshold')
            ->orderBy('stock_qty')
            ->get(['id', 'name', 'stock_qty', 'low_stock_threshold'])
            ->toArray();

        // Weekly insights (admin only)
        $insights = null;
        if (!$isBarber || $isOwnerBarber) {
            $weekStart = Carbon::now()->startOfWeek();
            $weekEnd   = Carbon::now()->endOfWeek();

            // Top barber this week (most completed appointments)
            $topBarber = DB::table('appointments')
                ->join('barbers', 'appointments.barber_id', '=', 'barbers.id')
                ->join('users', 'barbers.user_id', '=', 'users.id')
                ->where('appointments.company_id', $user->company_id)
                ->where('appointments.status', 'completed')
                ->whereBetween('appointments.starts_at', [$weekStart, $weekEnd])
                ->select('users.name', DB::raw('COUNT(*) as count'))
                ->groupBy('users.id', 'users.name')
                ->orderByDesc('count')
                ->first();

            // Most booked service this week
            $topService = DB::table('appointments')
                ->join('services', 'appointments.service_id', '=', 'services.id')
                ->where('appointments.company_id', $user->company_id)
                ->whereNotIn('appointments.status', ['cancelled', 'no_show'])
                ->whereBetween('appointments.starts_at', [$weekStart, $weekEnd])
                ->select('services.name', DB::raw('COUNT(*) as count'))
                ->groupBy('services.id', 'services.name')
                ->orderByDesc('count')
                ->first();

            // Repeat customers (booked more than once, all time)
            $repeatCustomers = Customer::where('company_id', $user->company_id)
                ->where('booking_total', '>', 1)
                ->count();

            // No-show rate this week
            $totalWeek  = Appointment::where('company_id', $user->company_id)
                ->whereBetween('starts_at', [$weekStart, $weekEnd])
                ->whereNotIn('status', ['cancelled'])
                ->count();
            $noShowWeek = Appointment::where('company_id', $user->company_id)
                ->whereBetween('starts_at', [$weekStart, $weekEnd])
                ->where('status', 'no_show')
                ->count();
            $noShowRate = $totalWeek > 0 ? round(($noShowWeek / $totalWeek) * 100) : 0;

            $insights = [
                'top_barber'       => $topBarber  ? ['name' => $topBarber->name,  'count' => (int) $topBarber->count]  : null,
                'top_service'      => $topService ? ['name' => $topService->name, 'count' => (int) $topService->count] : null,
                'repeat_customers' => $repeatCustomers,
                'no_show_rate'     => $noShowRate,
            ];
        }

        // Getting started checklist (admin only, including owner-barbers)
        $setup = null;
        if (!$isBarber || $isOwnerBarber) {
            $company = $user->company;
            $hasBarbers  = Barber::where('company_id', $company->id)->where('is_active', true)->where('user_id', '!=', $user->id)->exists();
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
            'insights' => $insights,
            'is_barber'          => $isBarber && !$isOwnerBarber,
            'is_owner_barber'    => $isOwnerBarber,
            'my_stats'           => $myStats,
            'my_today_schedule'  => $myTodaySchedule,
            'my_upcoming'        => $myUpcoming,
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
