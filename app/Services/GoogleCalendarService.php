<?php

namespace App\Services;

use App\Models\Appointment;
use App\Models\Barber;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GoogleCalendarService
{
    private string $clientId;
    private string $clientSecret;
    private string $redirectUri;

    public function __construct()
    {
        $this->clientId     = config('services.google.client_id', '');
        $this->clientSecret = config('services.google.client_secret', '');
        $this->redirectUri  = config('services.google.redirect', '');
    }

    /**
     * Generate OAuth authorization URL for a barber.
     */
    public function getAuthUrl(int $barberId): string
    {
        $params = http_build_query([
            'client_id'     => $this->clientId,
            'redirect_uri'  => $this->redirectUri,
            'response_type' => 'code',
            'scope'         => 'https://www.googleapis.com/auth/calendar.events',
            'access_type'   => 'offline',
            'prompt'        => 'consent',
            'state'         => $barberId,
        ]);
        return 'https://accounts.google.com/o/oauth2/v2/auth?' . $params;
    }

    /**
     * Exchange OAuth code for tokens and store on barber.
     */
    public function handleCallback(Barber $barber, string $code): bool
    {
        $response = Http::asForm()->post('https://oauth2.googleapis.com/token', [
            'code'          => $code,
            'client_id'     => $this->clientId,
            'client_secret' => $this->clientSecret,
            'redirect_uri'  => $this->redirectUri,
            'grant_type'    => 'authorization_code',
        ]);

        if (! $response->successful()) {
            Log::error('Google OAuth token exchange failed', ['body' => $response->body()]);
            return false;
        }

        $data = $response->json();
        $barber->update([
            'google_access_token'     => $data['access_token'],
            'google_refresh_token'    => $data['refresh_token'] ?? $barber->google_refresh_token,
            'google_token_expires_at' => now()->addSeconds($data['expires_in'] ?? 3600),
            'google_calendar_enabled' => true,
        ]);

        return true;
    }

    /**
     * Refresh access token if expired.
     */
    public function refreshTokenIfNeeded(Barber $barber): bool
    {
        if (! $barber->google_token_expires_at || now()->lt($barber->google_token_expires_at->subMinutes(5))) {
            return true; // still valid
        }

        $response = Http::asForm()->post('https://oauth2.googleapis.com/token', [
            'refresh_token' => $barber->google_refresh_token,
            'client_id'     => $this->clientId,
            'client_secret' => $this->clientSecret,
            'grant_type'    => 'refresh_token',
        ]);

        if (! $response->successful()) {
            Log::error('Google token refresh failed', ['barber_id' => $barber->id]);
            return false;
        }

        $data = $response->json();
        $barber->update([
            'google_access_token'     => $data['access_token'],
            'google_token_expires_at' => now()->addSeconds($data['expires_in'] ?? 3600),
        ]);
        $barber->refresh();

        return true;
    }

    /**
     * Create or update a Google Calendar event for an appointment.
     */
    public function syncAppointment(Appointment $appointment): void
    {
        $barber = $appointment->barber;
        if (! $barber || ! $barber->google_calendar_enabled || ! $barber->google_access_token) {
            return;
        }

        if (! $this->refreshTokenIfNeeded($barber)) {
            return;
        }

        $body = [
            'summary'     => $this->eventSummary($appointment),
            'description' => $this->eventDescription($appointment),
            'start'       => ['dateTime' => $appointment->starts_at->toRfc3339String(), 'timeZone' => 'UTC'],
            'end'         => ['dateTime' => $appointment->ends_at->toRfc3339String(),   'timeZone' => 'UTC'],
        ];

        $eventId = $appointment->google_calendar_event_id;

        if ($eventId) {
            $response = Http::withToken($barber->google_access_token)
                ->patch("https://www.googleapis.com/calendar/v3/calendars/primary/events/{$eventId}", $body);
        } else {
            $response = Http::withToken($barber->google_access_token)
                ->post('https://www.googleapis.com/calendar/v3/calendars/primary/events', $body);
        }

        if ($response->successful()) {
            $appointment->update(['google_calendar_event_id' => $response->json('id')]);
        } else {
            Log::error('Google Calendar sync failed', ['appointment_id' => $appointment->id, 'body' => $response->body()]);
        }
    }

    /**
     * Delete a Google Calendar event when appointment is cancelled.
     */
    public function deleteEvent(Appointment $appointment): void
    {
        $barber = $appointment->barber;
        if (! $barber || ! $barber->google_calendar_enabled || ! $appointment->google_calendar_event_id) {
            return;
        }

        if (! $this->refreshTokenIfNeeded($barber)) {
            return;
        }

        Http::withToken($barber->google_access_token)
            ->delete("https://www.googleapis.com/calendar/v3/calendars/primary/events/{$appointment->google_calendar_event_id}");

        $appointment->update(['google_calendar_event_id' => null]);
    }

    /**
     * Disconnect Google Calendar for a barber.
     */
    public function disconnect(Barber $barber): void
    {
        $barber->update([
            'google_access_token'     => null,
            'google_refresh_token'    => null,
            'google_token_expires_at' => null,
            'google_calendar_enabled' => false,
        ]);
    }

    private function eventSummary(Appointment $appointment): string
    {
        $customer = $appointment->customer?->name ?? 'Customer';
        $service  = $appointment->service?->name ?? 'Appointment';
        return "{$customer} — {$service}";
    }

    private function eventDescription(Appointment $appointment): string
    {
        $lines = [];
        if ($appointment->customer?->phone) $lines[] = "Phone: {$appointment->customer->phone}";
        if ($appointment->notes) $lines[] = "Notes: {$appointment->notes}";
        return implode("\n", $lines);
    }
}
