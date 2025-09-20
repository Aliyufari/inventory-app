<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Product;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $products = Product::paginate(10)->through(fn($product) => [
            'id' => $product->id,
            'name' => $product->name,
            'price' => $product->price,
            'quantity' => $product->quantity,
            'brand' => $product->brand,
            'description' => $product->description,
            'store' => [
                'id' => $product->store->id,
                'name' => $product->store->name,
            ],
            'category' => [
                'id' => $product->category->id,
                'name' => $product->category->name,
            ],
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

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProductRequest $request)
    {
        try {
            $data = $request->validated();

            $product = Product::create($data);

            // return to_route('users.index');

            return redirect()->back()->with([
                'status' => true,
                'message' => 'Product added successfully',
                'product' => $product
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->withErrors([
                'status' => false,
                'errors' => $e->getMessage()
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
            $product->refresh();
            // return to_route('users.index');

            return redirect()->back()->with([
                'status' => true,
                'message' => 'Product added successfully',
                'product' => $product
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->withErrors([
                'status' => false,
                'errors' => $e->getMessage()
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

            return redirect()->back()->with([
                'status' => true,
                'message' => 'Product deleted successfully'
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->withErrors([
                'status' => false,
                'errors' => $e->getMessage()
            ]);
        }
    }
}
