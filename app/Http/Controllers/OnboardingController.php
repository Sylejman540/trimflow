<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;

class OnboardingController extends Controller
{
    public function create()
    {
        if (Auth::user()->company_id) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('Onboarding');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
        ]);

        $company = Company::create([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']) . '-' . Str::random(4),
            'email' => $validated['email'] ?? null,
            'phone' => $validated['phone'] ?? null,
        ]);

        $user = Auth::user();
        $user->company_id = $company->id;
        $user->save();
        $user->assignRole('shop-admin');

        return redirect()->route('dashboard');
    }
}
