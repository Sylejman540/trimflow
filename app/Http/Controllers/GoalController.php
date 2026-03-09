<?php

namespace App\Http\Controllers;

use App\Models\ShopGoal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class GoalController extends Controller
{
    public function update(Request $request)
    {
        $this->authorize('create', ShopGoal::class);

        $validated = $request->validate([
            'month'           => 'required|integer|min:1|max:12',
            'year'            => 'required|integer|min:2020|max:2100',
            'revenue_target'  => 'required|numeric|min:0',
            'bookings_target' => 'required|integer|min:0',
        ]);

        $user = Auth::user();

        ShopGoal::updateOrCreate(
            [
                'company_id' => $user->company_id,
                'month'      => $validated['month'],
                'year'       => $validated['year'],
            ],
            [
                'revenue_target'  => (int) round($validated['revenue_target'] * 100),
                'bookings_target' => $validated['bookings_target'],
            ]
        );

        return back()->with('success', 'Goals updated.');
    }
}
