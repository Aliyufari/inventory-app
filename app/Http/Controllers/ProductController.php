<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Store;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Support\Facades\Log;
use App\Http\Resources\ProductResource;
use Illuminate\Support\Facades\Storage;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $query = Product::query()
                ->with(['store', 'categories', 'creator', 'updator']);

            if ($search = request('search')) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('brand', 'like', "%{$search}%")
                        ->orWhere('barcode', 'like', "%{$search}%")
                        ->orWhereHas(
                            'store',
                            fn($q) =>
                            $q->where('name', 'like', "%{$search}%")
                        );
                });
            }

            if ($category = request('category')) {
                if ($category !== 'all') {
                    $query->whereHas(
                        'categories',
                        fn($q) =>
                        $q->where('name', $category)
                    );
                }
            }

            if (request()->filled('status') && request('status') !== 'all') {
                $query->where(
                    'status',
                    filter_var(request('status'), FILTER_VALIDATE_BOOLEAN)
                );
            }

            $data = $query
                ->latest()
                ->paginate(10)
                ->withQueryString();

            if (request()->expectsJson()) {
                return response()->json([
                    'products' => ProductResource::collection($query->get())
                ]);
            }

            return Inertia::render('products/Index', [
                'data' => ProductResource::collection($data),
                'categories' => Category::all(),
                'stores' => Store::all(),
            ]);
        } catch (\Throwable $e) {
            Log::error('Error retrieving products', [
                'message' => $e->getMessage(),
            ]);

            return back()->withErrors([
                'message' => 'Error retrieving products.',
            ]);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProductRequest $request)
    {
        try {
            $data = $request->validated();

            $data['creator_id'] = auth()->id();

            if ($request->hasFile('image')) {
                $data['image'] = $request->file('image')->store('products', 'public');
            }

            $categoryIds = $data['category_ids'];
            unset($data['category_ids']);

            $product = Product::create($data);

            $product->categories()->sync($categoryIds);

            return back()->with([
                'status' => true,
                'message' => 'Product added successfully',
                'product_id' => $product->id,
            ]);
        } catch (\Throwable $e) {
            Log::error('Error adding product: ' . $e->getMessage());

            return back()->withErrors([
                'status' => false,
                'message' => 'Error adding product.'
            ]);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProductRequest $request, Product $product)
    {
        try {
            $data = $request->validated();

            $data['updator_id'] = auth()->id();

            if ($request->hasFile('image')) {
                if ($product->image) {
                    Storage::disk('public')->delete($product->image);
                }

                $data['image'] = $request->file('image')->store('products', 'public');
            }

            $categoryIds = $data['category_ids'];
            unset($data['category_ids']);

            $product->update($data);

            $product->categories()->sync($categoryIds);

            $product->refresh()->load(['categories', 'creator']);

            return back()->with([
                'status' => true,
                'message' => 'Product updated successfully',
                'product' => $product,
            ]);
        } catch (\Throwable $e) {
            Log::error('Error updating product: ' . $e->getMessage());

            return back()->withErrors([
                'status' => false,
                'message' => 'Error updating product.'
            ]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        try {
            if ($product->image && Storage::disk('public')->exists($product->image)) {
                Storage::disk('public')->delete($product->image);
            }

            $product->delete();

            return back()->with([
                'status' => true,
                'message' => 'Product deleted successfully',
            ], 200);
        } catch (\Throwable $e) {
            Log::error('Error deleting product', [
                'product_id' => $product->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'status' => false,
                'message' => 'Error deleting product',
            ], 500);
        }
    }
}
