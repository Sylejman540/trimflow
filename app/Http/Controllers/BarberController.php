<?php

namespace App\Http\Controllers;

use App\Models\Barber;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class BarberController extends Controller
{
    public function index()
    {
        $this->authorize('viewAny', Barber::class);

        return Inertia::render('barbers/Index', [
            'barbers' => Barber::with('user')->orderBy('created_at', 'desc')->get(),
        ]);
    }

    public function create()
    {
        $this->authorize('create', Barber::class);

        return Inertia::render('barbers/Create');
    }

    public function store(Request $request)
    {
        $this->authorize('create', Barber::class);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'bio' => 'nullable|string|max:1000',
            'specialty' => 'nullable|string|max:500',
        ]);

        DB::transaction(function () use ($validated) {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'company_id' => Auth::user()->company_id,
            ]);

            $user->assignRole('barber');

            Barber::create([
                'user_id' => $user->id,
                'bio' => $validated['bio'] ?? null,
                'specialty' => $validated['specialty'] ?? null,
                'is_active' => true,
            ]);
        });

        return redirect()->route('barbers.index')->with('success', 'Barber created.');
    }

    public function edit(Barber $barber)
    {
        $this->authorize('update', $barber);

        $barber->load('user');

        return Inertia::render('barbers/Edit', [
            'barber' => $barber,
        ]);
    }

    public function update(Request $request, Barber $barber)
    {
        $this->authorize('update', $barber);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $barber->user_id,
            'bio' => 'nullable|string|max:1000',
            'specialty' => 'nullable|string|max:500',
            'is_active' => 'boolean',
        ]);

        DB::transaction(function () use ($validated, $barber) {
            $barber->user->update([
                'name' => $validated['name'],
                'email' => $validated['email'],
            ]);

            $barber->update([
                'bio' => $validated['bio'] ?? null,
                'specialty' => $validated['specialty'] ?? null,
                'is_active' => $validated['is_active'] ?? $barber->is_active,
            ]);
        });

        return redirect()->route('barbers.index')->with('success', 'Barber updated.');
    }

    public function destroy(Barber $barber)
    {
        $this->authorize('delete', $barber);

        $barber->delete();

        return redirect()->route('barbers.index')->with('success', 'Barber deleted.');
    }
}
