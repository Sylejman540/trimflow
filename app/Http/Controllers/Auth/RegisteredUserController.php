<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name'      => 'required|string|max:255',
            'shop_name' => 'required|string|max:255',
            'email'     => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'password'  => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        // Create the company with a unique slug
        $baseSlug = Str::slug($request->shop_name) ?: 'shop';
        $slug = $baseSlug;
        $i = 1;
        while (Company::where('slug', $slug)->exists()) {
            $slug = $baseSlug . '-' . $i++;
        }

        $company = Company::create([
            'name'      => $request->shop_name,
            'slug'      => $slug,
            'is_active' => true,
        ]);

        $user = User::create([
            'name'       => $request->name,
            'email'      => $request->email,
            'password'   => Hash::make($request->password),
            'company_id' => $company->id,
        ]);

        $user->assignRole('shop-admin');

        event(new Registered($user));

        Auth::login($user);

        return redirect(route('dashboard', absolute: false));
    }
}
