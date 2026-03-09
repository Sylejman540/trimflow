<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Product;
use Illuminate\Http\Request;

class AppointmentProductController extends Controller
{
    public function store(Request $request, Appointment $appointment)
    {
        $v = $request->validate([
            'product_id' => 'required|exists:products,id',
            'qty'        => 'required|integer|min:1|max:100',
        ]);

        $product = Product::findOrFail($v['product_id']);

        // Prevent duplicate pivot entry — if exists, increment qty
        $existing = $appointment->products()->where('product_id', $product->id)->first();
        if ($existing) {
            $appointment->products()->updateExistingPivot($product->id, [
                'qty' => $existing->pivot->qty + $v['qty'],
            ]);
        } else {
            $appointment->products()->attach($product->id, [
                'qty'        => $v['qty'],
                'unit_price' => $product->price,
            ]);
        }

        // Decrement stock atomically
        $product->decrement('stock_qty', $v['qty']);

        return back()->with('success', 'Product added.');
    }

    public function destroy(Appointment $appointment, Product $product)
    {
        $pivot = $appointment->products()->where('product_id', $product->id)->first();
        if ($pivot) {
            $product->increment('stock_qty', $pivot->pivot->qty); // restore stock
            $appointment->products()->detach($product->id);
        }

        return back()->with('success', 'Product removed.');
    }
}
