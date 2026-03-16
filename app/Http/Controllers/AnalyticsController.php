<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Customer;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AnalyticsController extends Controller
{
    public function index()
    {
        $this->authorize('viewAnalytics', Appointment::class);

        $user = Auth::user();
        $companyId = $user->company_id;

        // Date range (last 30 days)
        $endDate = Carbon::now();
        $startDate = $endDate->copy()->subDays(30);

        // ── BOOKING FUNNEL ─────────────────────────────────────────────────────
        // Track: Views → Configurations → Confirmations
        $funnel = $this->getBookingFunnel($companyId, $startDate, $endDate);

        // ── CONVERSION METRICS ─────────────────────────────────────────────────
        // Total bookings, completion rate, no-show rate, revenue
        $metrics = $this->getConversionMetrics($companyId, $startDate, $endDate);

        // ── REVENUE TREND ─────────────────────────────────────────────────────
        // Daily revenue chart data
        $revenueTrend = $this->getRevenueTrend($companyId, $startDate, $endDate);

        // ── CUSTOMER ACQUISITION ──────────────────────────────────────────────
        // New vs returning customers
        $customerAcquisition = $this->getCustomerAcquisition($companyId, $startDate, $endDate);

        // ── BUSIEST TIMES ─────────────────────────────────────────────────────
        // Heatmap: day of week + hour of day
        $busyTimes = $this->getBusyTimes($companyId, $startDate, $endDate);

        // ── BARBER PERFORMANCE ────────────────────────────────────────────────
        // Top barbers by bookings, revenue, ratings
        $barberPerformance = $this->getBarberPerformance($companyId, $startDate, $endDate);

        // ── SERVICE BREAKDOWN ─────────────────────────────────────────────────
        // Most booked services
        $serviceBreakdown = $this->getServiceBreakdown($companyId, $startDate, $endDate);

        return Inertia::render('analytics/Index', [
            'funnel' => $funnel,
            'metrics' => $metrics,
            'revenueTrend' => $revenueTrend,
            'customerAcquisition' => $customerAcquisition,
            'busyTimes' => $busyTimes,
            'barberPerformance' => $barberPerformance,
            'serviceBreakdown' => $serviceBreakdown,
            'dateRange' => [
                'start' => $startDate->format('Y-m-d'),
                'end' => $endDate->format('Y-m-d'),
            ],
        ]);
    }

    private function getBookingFunnel($companyId, $startDate, $endDate): array
    {
        $total = Appointment::where('company_id', $companyId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        $confirmed = Appointment::where('company_id', $companyId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->whereNotIn('status', ['pending', 'cancelled'])
            ->count();

        $completed = Appointment::where('company_id', $companyId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->where('status', 'completed')
            ->count();

        return [
            ['step' => 'Bookings Created', 'value' => $total, 'percentage' => 100],
            ['step' => 'Confirmed/Active', 'value' => $confirmed, 'percentage' => $total > 0 ? round(($confirmed / $total) * 100) : 0],
            ['step' => 'Completed', 'value' => $completed, 'percentage' => $total > 0 ? round(($completed / $total) * 100) : 0],
        ];
    }

    private function getConversionMetrics($companyId, $startDate, $endDate): array
    {
        $total = Appointment::where('company_id', $companyId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        $completed = Appointment::where('company_id', $companyId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->where('status', 'completed')
            ->count();

        $noShow = Appointment::where('company_id', $companyId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->where('status', 'no_show')
            ->count();

        $cancelled = Appointment::where('company_id', $companyId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->where('status', 'cancelled')
            ->count();

        $revenue = (int) Appointment::where('company_id', $companyId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->where('status', 'completed')
            ->sum('price');

        return [
            'total_bookings' => $total,
            'completion_rate' => $total > 0 ? round(($completed / $total) * 100) : 0,
            'no_show_rate' => $total > 0 ? round(($noShow / $total) * 100) : 0,
            'cancellation_rate' => $total > 0 ? round(($cancelled / $total) * 100) : 0,
            'total_revenue' => $revenue,
            'avg_booking_value' => $completed > 0 ? round($revenue / $completed) : 0,
        ];
    }

    private function getRevenueTrend($companyId, $startDate, $endDate): array
    {
        $days = [];
        $current = $startDate->copy();

        while ($current <= $endDate) {
            $dayStart = $current->copy()->startOfDay();
            $dayEnd = $current->copy()->endOfDay();

            $revenue = (int) Appointment::where('company_id', $companyId)
                ->whereBetween('created_at', [$dayStart, $dayEnd])
                ->where('status', 'completed')
                ->sum('price');

            $days[] = [
                'date' => $current->format('M d'),
                'revenue' => $revenue,
            ];

            $current->addDay();
        }

        return $days;
    }

    private function getCustomerAcquisition($companyId, $startDate, $endDate): array
    {
        $newCustomers = Customer::where('company_id', $companyId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        $allCustomers = Customer::where('company_id', $companyId)
            ->whereHas('appointments', fn ($q) => $q->whereBetween('created_at', [$startDate, $endDate]))
            ->count();

        $returningCustomers = $allCustomers - $newCustomers;

        return [
            ['name' => 'New Customers', 'value' => $newCustomers],
            ['name' => 'Returning Customers', 'value' => $returningCustomers],
        ];
    }

    private function getBusyTimes($companyId, $startDate, $endDate): array
    {
        $data = DB::table('appointments')
            ->select(
                DB::raw('DAYNAME(starts_at) as day'),
                DB::raw('HOUR(starts_at) as hour'),
                DB::raw('COUNT(*) as count')
            )
            ->where('company_id', $companyId)
            ->whereBetween('starts_at', [$startDate, $endDate])
            ->whereNotIn('status', ['cancelled', 'no_show'])
            ->groupBy('day', 'hour')
            ->get()
            ->map(fn ($row) => [
                'day' => $row->day,
                'hour' => "{$row->hour}:00",
                'bookings' => $row->count,
            ])
            ->toArray();

        return $data;
    }

    private function getBarberPerformance($companyId, $startDate, $endDate): array
    {
        return DB::table('appointments')
            ->join('barbers', 'appointments.barber_id', '=', 'barbers.id')
            ->join('users', 'barbers.user_id', '=', 'users.id')
            ->where('appointments.company_id', $companyId)
            ->whereBetween('appointments.created_at', [$startDate, $endDate])
            ->select(
                'users.name',
                DB::raw('COUNT(*) as bookings'),
                DB::raw('SUM(appointments.price) as revenue'),
                DB::raw('SUM(CASE WHEN appointments.status = \'completed\' THEN 1 ELSE 0 END) as completed')
            )
            ->groupBy('barbers.id', 'users.name')
            ->orderByDesc('revenue')
            ->limit(5)
            ->get()
            ->map(fn ($row) => [
                'name' => $row->name,
                'bookings' => (int) $row->bookings,
                'revenue' => (int) $row->revenue,
                'completed' => (int) $row->completed,
            ])
            ->toArray();
    }

    private function getServiceBreakdown($companyId, $startDate, $endDate): array
    {
        return DB::table('appointments')
            ->join('services', 'appointments.service_id', '=', 'services.id')
            ->where('appointments.company_id', $companyId)
            ->whereBetween('appointments.created_at', [$startDate, $endDate])
            ->whereNotIn('appointments.status', ['cancelled', 'no_show'])
            ->select(
                'services.name',
                DB::raw('COUNT(*) as bookings'),
                DB::raw('SUM(appointments.price) as revenue')
            )
            ->groupBy('services.id', 'services.name')
            ->orderByDesc('revenue')
            ->get()
            ->map(fn ($row) => [
                'service' => $row->name,
                'bookings' => (int) $row->bookings,
                'revenue' => (int) $row->revenue,
            ])
            ->toArray();
    }
}
