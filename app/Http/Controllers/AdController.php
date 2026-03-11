<?php

namespace App\Http\Controllers;

use App\Models\Ad;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AdController extends Controller
{
    public function index()
    {
        abort_unless(Auth::user()->hasRole('shop-admin'), 403);

        $ads = Auth::user()->company->ads()->latest()->get();

        return Inertia::render('ads/Index', [
            'ads' => $ads,
        ]);
    }

    public function store(Request $request)
    {
        abort_unless(Auth::user()->hasRole('shop-admin'), 403);

        $validated = $request->validate([
            'headline' => 'required|string|max:120',
            'sub'      => 'nullable|string|max:60',
            'emoji'    => 'nullable|string|max:8',
        ]);

        Auth::user()->company->ads()->create(array_merge($validated, [
            'emoji' => $validated['emoji'] ?: '💈',
        ]));

        return back()->with('success', 'Ad created.');
    }

    public function update(Request $request, Ad $ad)
    {
        abort_unless(Auth::user()->hasRole('shop-admin'), 403);
        abort_unless($ad->company_id === Auth::user()->company->id, 403);

        $validated = $request->validate([
            'headline'  => 'required|string|max:120',
            'sub'       => 'nullable|string|max:60',
            'emoji'     => 'nullable|string|max:8',
            'is_active' => 'boolean',
        ]);

        $ad->update($validated);

        return back()->with('success', 'Ad updated.');
    }

    public function destroy(Ad $ad)
    {
        abort_unless(Auth::user()->hasRole('shop-admin'), 403);
        abort_unless($ad->company_id === Auth::user()->company->id, 403);

        $ad->delete();

        return back()->with('success', 'Ad deleted.');
    }
}
