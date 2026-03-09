<?php

namespace App\Http\Controllers;

use App\Models\Service;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ServiceController extends Controller
{
    public function index()
    {
        $this->authorize('viewAny', Service::class);

        return Inertia::render('services/Index', [
            'services' => Service::orderBy('name')->get(),
        ]);
    }

    public function create()
    {
        $this->authorize('create', Service::class);

        return Inertia::render('services/Create');
    }

    public function store(Request $request)
    {
        $this->authorize('create', Service::class);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'duration' => 'required|integer|min:5|max:480',
            'price' => 'required|integer|min:0',
            'description' => 'nullable|string|max:1000',
            'category' => 'nullable|string|max:255',
            'color' => 'nullable|string|in:slate,red,orange,amber,green,teal,blue,violet',
            'is_active' => 'boolean',
        ]);

        Service::create($validated);

        return redirect()->route('services.index')->with('success', 'Service created.');
    }

    public function edit(Service $service)
    {
        $this->authorize('update', $service);

        return Inertia::render('services/Edit', [
            'service' => $service,
        ]);
    }

    public function update(Request $request, Service $service)
    {
        $this->authorize('update', $service);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'duration' => 'required|integer|min:5|max:480',
            'price' => 'required|integer|min:0',
            'description' => 'nullable|string|max:1000',
            'category' => 'nullable|string|max:255',
            'color' => 'nullable|string|in:slate,red,orange,amber,green,teal,blue,violet',
            'is_active' => 'boolean',
        ]);

        $service->update($validated);

        return redirect()->route('services.index')->with('success', 'Service updated.');
    }

    public function destroy(Service $service)
    {
        $this->authorize('delete', $service);

        $service->delete();

        return redirect()->route('services.index')->with('success', 'Service deleted.');
    }
}
