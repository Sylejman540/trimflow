<?php

namespace App\Http\Controllers;

use App\Models\MarqueeSponsor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;

class MarqueeSponsorController extends Controller
{
    /**
     * Public endpoint — returns active sponsors for the landing page marquee.
     */
    public function public(): JsonResponse
    {
        $sponsors = MarqueeSponsor::visible()
            ->orderBy('created_at')
            ->get(['id', 'shop_name', 'url']);

        return response()->json($sponsors);
    }

    /**
     * Admin list.
     */
    public function index(): \Inertia\Response
    {
        $sponsors = MarqueeSponsor::latest()->get();

        return inertia('admin/MarqueeSponsors', [
            'sponsors' => $sponsors,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'shop_name'    => 'required|string|max:80',
            'url'          => 'nullable|url|max:255',
            'amount_paid'  => 'required|integer|min:0',
            'active_until' => 'nullable|date|after:today',
            'is_active'    => 'boolean',
        ]);

        MarqueeSponsor::create($validated);

        return back()->with('success', 'Sponsor added.');
    }

    public function update(Request $request, MarqueeSponsor $sponsor): RedirectResponse
    {
        $validated = $request->validate([
            'shop_name'    => 'required|string|max:80',
            'url'          => 'nullable|url|max:255',
            'amount_paid'  => 'required|integer|min:0',
            'active_until' => 'nullable|date',
            'is_active'    => 'boolean',
        ]);

        $sponsor->update($validated);

        return back()->with('success', 'Sponsor updated.');
    }

    public function destroy(MarqueeSponsor $sponsor): RedirectResponse
    {
        $sponsor->delete();

        return back()->with('success', 'Sponsor removed.');
    }
}
