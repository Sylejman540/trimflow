<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function index(Request $request)
    {
        $user     = $request->user();
        $isBarber = $user->hasRole('barber') && ! $user->hasRole('shop-admin');
        $company  = $user->company;

        $currentSessionId = $request->session()->getId();

        $sessions = DB::table('sessions')
            ->where('user_id', $user->id)
            ->orderByDesc('last_activity')
            ->get()
            ->map(function ($s) use ($currentSessionId) {
                $ua = $s->user_agent ?? '';
                return [
                    'id'            => $s->id,
                    'ip_address'    => $s->ip_address,
                    'user_agent'    => $ua,
                    'last_activity' => $s->last_activity,
                    'is_current'    => $s->id === $currentSessionId,
                ];
            })
            ->values();

        return Inertia::render('settings/Index', [
            'mustVerifyEmail'    => $user instanceof \Illuminate\Contracts\Auth\MustVerifyEmail,
            'status'             => session('status'),
            'can_manage_company' => ! $isBarber,
            'booking_url'        => (! $isBarber && $company)
                ? url(route('booking.show', $company->slug))
                : null,
            'company'  => array_merge(
                $company->only('id', 'name', 'slug', 'email', 'phone', 'address', 'city', 'state', 'zip', 'country', 'timezone', 'max_closing_hour'),
                ['logo' => $company->logo ? asset('storage/' . $company->logo) : null]
            ),
            'sessions' => $sessions,
        ]);
    }

    public function updateCompany(Request $request)
    {
        abort_unless(Auth::user()->hasRole('shop-admin'), 403);

        $validated = $request->validate([
            'name'                => 'required|string|max:255',
            'email'               => 'nullable|email|max:255',
            'phone'               => 'nullable|string|max:50',
            'address'             => 'nullable|string|max:255',
            'city'                => 'nullable|string|max:100',
            'state'               => 'nullable|string|max:100',
            'zip'                 => 'nullable|string|max:20',
            'country'             => 'nullable|string|max:100',
            'timezone'            => 'nullable|string|max:100',
            'max_closing_hour'    => 'nullable|integer|min:20|max:24',
        ]);

        Auth::user()->company->update($validated);

        return back()->with('success', 'Settings saved.');
    }

    public function uploadLogo(Request $request)
    {
        abort_unless(Auth::user()->hasRole('shop-admin'), 403);

        $request->validate([
            'logo' => 'required|image|max:2048',
        ]);

        $company = Auth::user()->company;

        if ($company->logo) {
            Storage::disk('public')->delete($company->logo);
        }

        $path = $request->file('logo')->store('logos', 'public');
        $company->update(['logo' => $path]);

        return back()->with('success', 'Logo updated.');
    }

    public function destroyLogo()
    {
        abort_unless(Auth::user()->hasRole('shop-admin'), 403);

        $company = Auth::user()->company;

        if ($company->logo) {
            Storage::disk('public')->delete($company->logo);
            $company->update(['logo' => null]);
        }

        return back()->with('success', 'Logo removed.');
    }
}
