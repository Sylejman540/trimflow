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
            'company'         => $company->only('id', 'name', 'slug', 'email', 'phone', 'address', 'city', 'state', 'zip', 'country', 'timezone', 'meta_page_id', 'instagram_agent_enabled'),
            'has_meta_token'  => !empty($company->meta_access_token),
            'has_openai_key'  => !empty($company->openai_api_key),
            'webhook_url'     => url('/webhooks/instagram'),
            'verify_token'    => config('services.meta.verify_token'),
        ]);
    }

    public function updateCompany(Request $request)
    {
        abort_unless(Auth::user()->hasRole('shop-admin'), 403);

        $validated = $request->validate([
            'name'                    => 'required|string|max:255',
            'email'                   => 'nullable|email|max:255',
            'phone'                   => 'nullable|string|max:50',
            'address'                 => 'nullable|string|max:255',
            'city'                    => 'nullable|string|max:100',
            'state'                   => 'nullable|string|max:100',
            'zip'                     => 'nullable|string|max:20',
            'country'                 => 'nullable|string|max:100',
            'timezone'                => 'nullable|string|max:100',
            'meta_access_token'       => 'nullable|string',
            'meta_page_id'            => 'nullable|string|max:50',
            'openai_api_key'          => 'nullable|string',
            'instagram_agent_enabled' => 'boolean',
        ]);

        $company = Auth::user()->company;

        // Only update tokens if they were actually provided (don't blank them out)
        if (empty($validated['meta_access_token'])) {
            unset($validated['meta_access_token']);
        }
        if (empty($validated['openai_api_key'])) {
            unset($validated['openai_api_key']);
        }

        $company->update($validated);

        return back()->with('success', 'Settings saved.');
    }
}
