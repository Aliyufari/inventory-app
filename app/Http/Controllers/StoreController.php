<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Store;
use App\Http\Requests\StoreStoreRequest;
use App\Http\Requests\UpdateStoreRequest;

class StoreController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $query = Store::query();

        if ($search = request('search')) {
            $query->where('name', 'like', "%{$search}%");
        }

        $stores = $query->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn($store) => [
                'id' => $store->id,
                'name' => $store->name,
                'description' => $store->description,
                'created_at' => $store->created_at,
                'updated_at' => $store->updated_at,
            ]);

        if (request()->wantsJson()) {
            return response()->json(['stores' => $stores]);
        }

        return Inertia::render('stores/Index', [
            'stores' => $stores,
        ]);
    }

    public function list()
    {
        $stores = Store::latest()
            ->get()
            ->map(fn($store) => [
                'id' => $store->id,
                'name' => $store->name,
                'description' => $store->description,
                'created_at' => $store->created_at,
                'updated_at' => $store->updated_at,
            ]);

        return response()->json([
            'stores' => $stores,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreStoreRequest $request)
    {
        try {
            $data = $request->validated();

            $store = Store::create($data);

            // return to_route('users.index');

            return back()->with([
                'status' => true,
                'message' => 'Store added successfully',
                'store' => $store
            ]);
        } catch (\Throwable $e) {
            return back()->withErrors([
                'status' => false,
                'errors' => $e->getMessage()
            ]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Store $store)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateStoreRequest $request, Store $store)
    {
        try {
            $data = $request->validated();

            $store->update($data);
            $store->refresh();
            // return to_route('users.index');

            return back()->with([
                'status' => true,
                'message' => 'Store added successfully',
                'store' => $store
            ]);
        } catch (\Throwable $e) {
            return back()->withErrors([
                'status' => false,
                'errors' => $e->getMessage()
            ]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Store $store)
    {
        try {
            $store->delete();

            return response()->json([
                'status' => true,
                'message' => 'Store deleted successfully',
            ], 200);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
