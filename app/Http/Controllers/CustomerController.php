<?php

namespace App\Http\Controllers;

use App\Models\Barber;
use App\Models\Customer;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function index()
    {
        $customers = Customer::with('favoriteBarber.user')
            ->orderBy('name')
            ->get();

        return Inertia::render('customers/Index', [
            'customers' => $customers,
        ]);
    }

    public function create()
    {
        $barbers = Barber::with('user')->where('is_active', true)->get();

        return Inertia::render('customers/Create', [
            'barbers' => $barbers,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'favorite_barber_id' => 'nullable|exists:barbers,id',
            'notes' => 'nullable|string|max:1000',
        ]);

        Customer::create($validated);

        return redirect()->route('customers.index')->with('success', 'Customer created.');
    }

    public function edit(Customer $customer)
    {
        $customer->load('favoriteBarber.user');
        $barbers = Barber::with('user')->where('is_active', true)->get();

        return Inertia::render('customers/Edit', [
            'customer' => $customer,
            'barbers' => $barbers,
        ]);
    }

    public function update(Request $request, Customer $customer)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'favorite_barber_id' => 'nullable|exists:barbers,id',
            'notes' => 'nullable|string|max:1000',
        ]);

        $customer->update($validated);

        return redirect()->route('customers.index')->with('success', 'Customer updated.');
    }

    public function destroy(Customer $customer)
    {
        $customer->delete();

        return redirect()->route('customers.index')->with('success', 'Customer deleted.');
    }
}
