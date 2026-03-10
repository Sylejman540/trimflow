<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function index()
    {
        abort_unless(Auth::user()->hasRole('shop-admin'), 403);

        $company = Auth::user()->company;

        return Inertia::render('settings/Index', [
            'company' => $company->only('id', 'name', 'slug', 'email', 'phone', 'address', 'city', 'state', 'zip', 'country', 'timezone'),
            'twilio_configured' => ! empty(config('services.twilio.sid')),
            'twilio_from'       => config('services.twilio.from', ''),
        ]);
    }

    public function updateCompany(Request $request)
    {
        abort_unless(Auth::user()->hasRole('shop-admin'), 403);

        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'nullable|email|max:255',
            'phone'    => 'nullable|string|max:50',
            'address'  => 'nullable|string|max:255',
            'city'     => 'nullable|string|max:100',
            'state'    => 'nullable|string|max:100',
            'zip'      => 'nullable|string|max:20',
            'country'  => 'nullable|string|max:100',
            'timezone' => 'nullable|string|max:100',
        ]);

        Auth::user()->company->update($validated);

        return back()->with('success', 'Settings saved.');
    }
}
