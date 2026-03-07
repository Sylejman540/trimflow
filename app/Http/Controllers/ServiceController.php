<?php

namespace App\Http\Controllers;

use App\Models\Service;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ServiceController extends Controller
{
    public function index()
    {
        $services = Service::orderBy('name')->get();

        return Inertia::render('services/Index', [
            'services' => $services,
        ]);
    }

    public function create()
    {
        return Inertia::render('services/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'duration' => 'required|integer|min:5|max:480',
            'price' => 'required|integer|min:0',
            'description' => 'nullable|string|max:1000',
            'category' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        Service::create($validated);

        return redirect()->route('services.index')->with('success', 'Service created.');
    }

    public function edit(Service $service)
    {
        return Inertia::render('services/Edit', [
            'service' => $service,
        ]);
    }

    public function update(Request $request, Service $service)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'duration' => 'required|integer|min:5|max:480',
            'price' => 'required|integer|min:0',
            'description' => 'nullable|string|max:1000',
            'category' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        $service->update($validated);

        return redirect()->route('services.index')->with('success', 'Service updated.');
    }

    public function destroy(Service $service)
    {
        $service->delete();

        return redirect()->route('services.index')->with('success', 'Service deleted.');
    }
}
