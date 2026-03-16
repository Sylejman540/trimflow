<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class LoggingService
{
    /**
     * Log booking errors
     */
    public static function logBookingError(string $message, array $context = []): void
    {
        Log::error('Booking Error: ' . $message, $context);
    }

    /**
     * Log booking success
     */
    public static function logBookingSuccess(int $appointmentId, string $source = 'public'): void
    {
        Log::info('Booking Created', [
            'appointment_id' => $appointmentId,
            'source' => $source,
        ]);
    }

    /**
     * Log database errors
     */
    public static function logDatabaseError(string $message, array $context = []): void
    {
        Log::error('Database Error: ' . $message, $context);
    }

    /**
     * Log validation errors
     */
    public static function logValidationError(string $context, array $errors = []): void
    {
        Log::warning('Validation Failed: ' . $context, $errors);
    }

    /**
     * Log authorization failures
     */
    public static function logAuthorizationFailure(string $action, int $userId, string $resource): void
    {
        Log::warning('Authorization Failed', [
            'action' => $action,
            'user_id' => $userId,
            'resource' => $resource,
        ]);
    }

    /**
     * Log broadcast failures
     */
    public static function logBroadcastError(string $channel, \Throwable $exception): void
    {
        Log::error('Broadcast Error on channel: ' . $channel, [
            'exception' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString(),
        ]);
    }

    /**
     * Log API errors
     */
    public static function logApiError(string $endpoint, string $message, \Throwable $exception = null): void
    {
        Log::error('API Error on ' . $endpoint . ': ' . $message, [
            'exception' => $exception?->getMessage(),
        ]);
    }

    /**
     * Log booking conflict
     */
    public static function logBookingConflict(int $barberId, string $timeSlot): void
    {
        Log::warning('Booking Conflict Detected', [
            'barber_id' => $barberId,
            'time_slot' => $timeSlot,
        ]);
    }

    /**
     * Log performance issues
     */
    public static function logSlowQuery(string $query, float $duration): void
    {
        if ($duration > 1.0) {
            Log::warning('Slow Query Detected', [
                'query' => $query,
                'duration_ms' => $duration * 1000,
            ]);
        }
    }
}
