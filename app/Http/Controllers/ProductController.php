<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index()
    {
        return Inertia::render('products/Index', [
            'products' => Product::orderBy('name')->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('products/Create');
    }

    public function store(Request $request)
    {
        $v = $request->validate([
            'name'                => 'required|string|max:255',
            'category'            => 'nullable|string|max:255',
            'price'               => 'required|integer|min:0',
            'stock_qty'           => 'required|integer|min:0',
            'low_stock_threshold' => 'required|integer|min:0',
            'is_active'           => 'boolean',
        ]);

        Product::create($v);

        return redirect()->route('products.index')->with('success', 'Product created.');
    }

    public function edit(Product $product)
    {
        return Inertia::render('products/Edit', ['product' => $product]);
    }

    public function update(Request $request, Product $product)
    {
        $v = $request->validate([
            'name'                => 'required|string|max:255',
            'category'            => 'nullable|string|max:255',
            'price'               => 'required|integer|min:0',
            'stock_qty'           => 'required|integer|min:0',
            'low_stock_threshold' => 'required|integer|min:0',
            'is_active'           => 'boolean',
        ]);

        $product->update($v);

        return redirect()->route('products.index')->with('success', 'Product updated.');
    }

    public function destroy(Product $product)
    {
        $product->delete();

        return redirect()->route('products.index')->with('success', 'Product deleted.');
    }
}
