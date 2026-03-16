<?php

namespace App\Services;

use App\Models\Barber;
use App\Models\Service;
use App\Models\Company;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Carbon;

class CachingService
{
    /**
     * Get barber availability with caching (5 minutes)
     */
    public static function barberAvailability(int $barberId, string $date): array
    {
        $cacheKey = "barber_availability:{$barberId}:{$date}";

        return Cache::remember($cacheKey, 300, function () use ($barberId) {
            $barber = Barber::with('user')->find($barberId);
            return $barber ? $barber->toArray() : [];
        });
    }

    /**
     * Get company working hours with caching (1 day)
     */
    public static function companyWorkingHours(int $companyId): array
    {
        $cacheKey = "company_hours:{$companyId}";

        return Cache::remember($cacheKey, 86400, function () use ($companyId) {
            $company = Company::find($companyId);
            return $company->working_hours ?? [];
        });
    }

    /**
     * Get active services for company (1 hour)
     */
    public static function companyServices(int $companyId): array
    {
        $cacheKey = "company_services:{$companyId}";

        return Cache::remember($cacheKey, 3600, function () use ($companyId) {
            return Service::where('company_id', $companyId)
                ->where('is_active', true)
                ->orderBy('name')
                ->get()
                ->toArray();
        });
    }

    /**
     * Get active barbers for company (1 hour)
     */
    public static function companyBarbers(int $companyId): array
    {
        $cacheKey = "company_barbers:{$companyId}";

        return Cache::remember($cacheKey, 3600, function () use ($companyId) {
            return Barber::where('company_id', $companyId)
                ->where('is_active', true)
                ->with('user')
                ->get()
                ->toArray();
        });
    }

    /**
     * Invalidate all caches for a company
     */
    public static function invalidateCompanyCache(int $companyId): void
    {
        Cache::forget("company_services:{$companyId}");
        Cache::forget("company_barbers:{$companyId}");
        Cache::forget("company_hours:{$companyId}");

        // Also invalidate barber-specific caches
        $barberIds = Barber::where('company_id', $companyId)->pluck('id');
        foreach ($barberIds as $barberId) {
            Cache::forget("barber_availability:{$barberId}:*");
        }
    }

    /**
     * Invalidate barber cache when changes occur
     */
    public static function invalidateBarberCache(int $barberId): void
    {
        $barber = Barber::find($barberId);
        if ($barber) {
            self::invalidateCompanyCache($barber->company_id);
        }
    }
}
