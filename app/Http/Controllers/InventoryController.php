<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Product;
use App\Models\Inventory;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\StoreInventoryRequest;
use App\Http\Requests\UpdateInventoryRequest;

class InventoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $inventories = Inventory::with(['user', 'items.product'])
            ->latest()
            ->paginate(10)
            ->through(fn($inventory) => [
                'id' => $inventory->id,
                'invoice_number' => $inventory->invoice_number,
                'user' => [
                    'id' => $inventory->user?->id,
                    'name' => $inventory->user?->name,
                ],
                'total' => $inventory->total,
                'payment_method' => $inventory->payment_method,
                'status' => $inventory->status,
                'created_at' => $inventory->created_at,
                'updated_at' => $inventory->updated_at,
            ]);

        if (request()->wantsJson()) {
            return response()->json(['inventories' => $inventories]);
        }

        return Inertia::render('inventory/Index', [
            'inventories' => $inventories,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreInventoryRequest $request)
    {
        DB::beginTransaction();

        try {
            $data = $request->validated();

            // Create inventory transaction
            $inventory = Inventory::create([
                'user_id'        => auth()->id(),
                'invoice_number' => Inventory::generateInvoiceNumber(),
                'payment_method' => $data['payment_method'],
                'subtotal'       => $data['subtotal'],
                'discount'       => $data['discount'] ?? 0,
                'tax'            => $data['tax'] ?? 0,
                'total'          => $data['total'],
                'status'         => 'completed',
            ]);

            // Save products with pivot data
            foreach ($data['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);

                // reduce stock
                $product->decrement('quantity', $item['quantity']);

                // attach to pivot
                $inventory->items()->attach($product->id, [
                    'quantity' => $item['quantity'],
                    'price'    => $item['price'],
                    'total'    => $item['total'],
                ]);
            }

            DB::commit();

            return redirect()->back()->with([
                'status' => true,
                'message' => 'Inventory transaction created successfully',
            ], JsonResponse::HTTP_CREATED);
        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()->withErrors([
                'status' => false,
                'errors' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Inventory $inventory)
    {
        $inventory->load(['user', 'items.product']);

        return response()->json([
            'status' => true,
            'inventory' => $inventory,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateInventoryRequest $request, Inventory $inventory)
    {
        DB::beginTransaction();

        try {
            $data = $request->validated();

            $inventory->update([
                'payment_method' => $data['payment_method'],
                'subtotal'       => $data['subtotal'],
                'discount'       => $data['discount'] ?? 0,
                'tax'            => $data['tax'] ?? 0,
                'total'          => $data['total'],
                'status'         => $data['status'] ?? $inventory->status,
            ]);

            // sync products
            $inventory->items()->detach();
            foreach ($data['items'] as $item) {
                $inventory->items()->attach($item['product_id'], [
                    'quantity' => $item['quantity'],
                    'price'    => $item['price'],
                    'total'    => $item['total'],
                ]);
            }

            DB::commit();

            return redirect()->back()->with([
                'status' => true,
                'message' => 'Inventory transaction updated successfully',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()->withErrors([
                'status' => false,
                'errors' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Inventory $inventory)
    {
        try {
            $inventory->delete();

            return redirect()->back()->with([
                'status' => true,
                'message' => 'Inventory transaction deleted successfully',
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->withErrors([
                'status' => false,
                'errors' => $e->getMessage(),
            ]);
        }
    }
}
