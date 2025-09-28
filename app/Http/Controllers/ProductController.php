<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Product;
use Illuminate\Support\Facades\Log;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $query = Product::with(['store', 'categories']);

        if ($search = request('search')) {
            $query->where('name', 'like', "%{$search}%")
                ->orWhere('brand', 'like', "%{$search}%")
                ->orWhereHas('store', fn($q) => $q->where('name', 'like', "%{$search}%"));
        }

        $products = $query->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn($product) => [
                'id' => $product->id,
                'name' => $product->name,
                'price' => $product->price,
                'quantity' => $product->quantity,
                'brand' => $product->brand,
                'description' => $product->description,
                'store' => $product->store
                    ? [
                        'id' => $product->store->id,
                        'name' => $product->store->name,
                    ]
                    : null,
                'categories' => $product->categories->map(fn($c) => [
                    'id' => $c->id,
                    'name' => $c->name,
                ]),
                'created_at' => $product->created_at,
                'updated_at' => $product->updated_at,
            ]);

        if (request()->wantsJson()) {
            return response()->json(['products' => $products]);
        }

        return Inertia::render('products/Index', [
            'products' => $products,
        ]);
    }

    public function list()
    {
        $products = Product::latest()
            ->get()
            ->map(fn($product) => [
                'id' => $product->id,
                'name' => $product->name,
                'price' => $product->price,
                'quantity' => $product->quantity,
                'brand' => $product->brand,
                'description' => $product->description,
                'store' => $product->store
                    ? [
                        'id' => $product->store->id,
                        'name' => $product->store->name,
                    ]
                    : null,
                'categories' => $product->categories->map(fn($c) => [
                    'id' => $c->id,
                    'name' => $c->name,
                ]),
                'created_at' => $product->created_at,
                'updated_at' => $product->updated_at,
            ]);

        return response()->json([
            'products' => $products,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProductRequest $request)
    {
        try {
            $data = $request->validated();

            $product = Product::create($data);

            if (isset($data['category_ids'])) {
                $product->categories()->sync($data['category_ids']);
            }

            return redirect()->back()->with([
                'status' => true,
                'message' => 'Product added successfully',
                'product_id' => $product->id
            ]);
        } catch (\Exception $e) {
            Log::error('Product store error: ' . $e->getMessage());

            return redirect()->back()->withErrors([
                'status' => false,
                'errors' => 'Something went wrong while adding the product.'
            ]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProductRequest $request, Product $product)
    {
        try {
            $data = $request->validated();

            $product->update($data);

            if (isset($data['category_ids'])) {
                $product->categories()->sync($data['category_ids']);
            }

            $product->refresh()->load('categories');

            return redirect()->back()->with([
                'status' => true,
                'message' => 'Product updated successfully',
                'product' => $product
            ]);
        } catch (\Exception $e) {
            Log::error('Product update error: ' . $e->getMessage());

            return redirect()->back()->withErrors([
                'status' => false,
                'errors' => 'Something went wrong while updating the product.'
            ]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        try {
            $product->delete();

            return response()->json([
                'status' => true,
                'message' => 'Product deleted successfully',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
