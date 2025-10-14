<?php

namespace App\Http\Controllers;

use App\Models\User;
use Inertia\Inertia;
use Pest\Support\Str;
use App\Models\Invoice;
use App\Models\Product;
use App\Models\Inventory;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\StoreInventoryRequest;
use App\Http\Requests\UpdateInventoryRequest;
use App\Models\Customer;
use App\Models\Role;

class InventoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $query = Inventory::with(['user', 'items.product']);

        if ($search = request('search')) {
            $query->where('invoice_number', 'like', "%{$search}%")
                ->orWhere('status', 'like', "%{$search}%")
                ->orWhere('total', 'like', "%{$search}%")
                ->orWhere('payment_method', 'like', "%{$search}%")
                ->orWhere('created_at', 'like', "%{$search}%")
                ->orWhereHas('user', fn($q) => $q->where('name', 'like', "%{$search}%"));
        }

        $inventories = $query->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn($inventory) => [
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
            // dd($data);
            $customerId = $this->resolveCustomer($data['customer'] ?? null, $data['customer_type']);

            // 🔹 Validate stock, discount, and pricing logic
            [$validatedItems, $subtotal, $totalBuyingCost] = $this->validateInventoryData($data);

            $discount = $data['discount'] ?? 0;
            $tax = $data['tax'] ?? 0;
            $total = $subtotal - $discount + $tax;

            // ✅ Create inventory
            $inventory = Inventory::create([
                'customer_id'    => $customerId,
                'customer_type'  => $data['customer_type'],
                'payment_method' => $data['payment_method'],
                'store_id'       => $data['store_id'],
                'subtotal'       => $subtotal,
                'discount'       => $discount,
                'tax'            => $tax,
                'total'          => $total,
                'note'           => $data['note'] ?? null,
                'user_id'        => auth()->id(),
                'status'         => 'completed',
            ]);

            // 🔹 Save inventory items and update stock
            foreach ($validatedItems as $item) {
                $inventory->items()->create([
                    'product_id'  => $item['product']->id,
                    'quantity'    => $item['quantity'],
                    'unit_price'  => $item['price'],
                    'total_price' => $item['quantity'] * $item['price'],
                ]);

                $item['product']->decrement('quantity', $item['quantity']);
            }

            DB::commit();

            return Inertia::render('inventory/Index', [
                'inventories' => Inventory::with(['user', 'customer', 'items.product'])->latest()->paginate(15),
                'inventory'   => $inventory->load('user', 'customer', 'items.product'),
                'status'      => true,
                'message'     => 'Transaction completed successfully',
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();

            return back()->withErrors([
                'error' => 'Failed to save transaction: ' . $e->getMessage(),
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
            'status'    => true,
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

            // rollback stock first
            foreach ($inventory->items as $oldItem) {
                $product = $oldItem->product;
                $restoreQty = $this->convertToBaseUnits($product, $oldItem->pivot->unit, $oldItem->pivot->quantity);
                $product->increment('quantity', $restoreQty);
            }

            $inventory->items()->detach();

            foreach ($data['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);

                $baseQty = $this->convertToBaseUnits($product, $item['unit'], $item['quantity']);

                $product->decrement('quantity', $baseQty);

                $inventory->items()->attach($product->id, [
                    'unit'      => $item['unit'],
                    'quantity'  => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'total'     => $item['total'],
                ]);
            }

            DB::commit();

            return redirect()->back()->with([
                'status'  => true,
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
            // restore stock
            foreach ($inventory->items as $oldItem) {
                $product = $oldItem->product;
                $restoreQty = $this->convertToBaseUnits($product, $oldItem->pivot->unit, $oldItem->pivot->quantity);
                $product->increment('quantity', $restoreQty);
            }

            $inventory->delete();

            return redirect()->back()->with([
                'status'  => true,
                'message' => 'Inventory transaction deleted successfully',
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->withErrors([
                'status' => false,
                'errors' => $e->getMessage(),
            ]);
        }
    }

    // Search products by name
    public function search(Request $request)
    {
        $q = $request->get('q');

        $products = Product::query()
            ->where('name', 'like', "%{$q}%")
            ->limit(10)
            ->get(['id', 'name', 'units_per_packet', 'packets_per_carton']);

        return response()->json($products);
    }

    // Get price based on customer type + unit
    public function price(Product $product, Request $request)
    {
        $customerType = $request->get('customerType', 'retail'); // retail or wholesale
        $unit = $request->get('unit', 'pcs');

        $basePrice = $customerType === 'retail'
            ? $product->retail_price
            : $product->wholesale_price;

        // Adjust for unit
        switch ($unit) {
            case 'packet':
                $price = $basePrice * $product->units_per_packet;
                break;
            case 'carton':
                $price = $basePrice * $product->units_per_packet * $product->packets_per_carton;
                break;
            default: // pcs
                $price = $basePrice;
                break;
        }

        return response()->json(['price' => $price]);
    }

    /**
     * Convert units to base quantity (pcs).
     */
    protected function convertToBaseUnits(Product $product, string $unit, int $qty): int
    {
        switch ($unit) {
            case 'packet':
                return $qty * ($product->units_per_packet ?? 1);
            case 'carton':
                return $qty * ($product->units_per_packet ?? 1) * ($product->packets_per_carton ?? 1);
            default: // pcs
                return $qty;
        }
    }

    /**
     * Resolve customer from request - can be UUID or name
     */
    private function resolveCustomer(?string $customerInput): ?string
    {
        if (!$customerInput) {
            return null; // Walk-in customer
        }

        // Check if input is a valid UUID (existing customer)
        if (Str::isUuid($customerInput)) {
            $customer = Customer::find($customerInput);
            return $customer ? $customer->id : null;
        }

        // Input is a name - create new customer
        $customer = Customer::create([
            'name' => $customerInput,
            'email' => $this->generateTemporaryEmail($customerInput),
        ]);

        return $customer->id;
    }

    /**
     * Generate a temporary email for new customers
     */
    private function generateTemporaryEmail(string $name): string
    {
        $slug = Str::slug($name);
        return "{$slug}@alameen-pharmacy.app";
    }

    /**
     * Validate stock, discount, and price consistency for inventory creation.
     *
     * @throws \Exception
     * @return array [$validatedItems, $subtotal, $totalBuyingCost]
     */
    private function validateInventoryData(array $data): array
    {
        $items = $data['items'] ?? [];

        if (empty($items)) {
            throw new \Exception("No items provided for this transaction.");
        }

        $productIds = collect($items)->pluck('product_id');
        $products = Product::whereIn('id', $productIds)->get()->keyBy('id');

        $subtotal = 0;
        $totalBuyingCost = 0;
        $validatedItems = [];

        foreach ($items as $item) {
            $product = $products[$item['product_id']] ?? null;

            if (!$product) {
                throw new \Exception("Product not found (ID: {$item['product_id']}).");
            }

            if ($product->quantity < $item['quantity']) {
                throw new \Exception("Insufficient stock for {$product->name}: Available {$product->quantity}, Requested {$item['quantity']}.");
            }

            $subtotal += $item['quantity'] * $item['price'];
            $totalBuyingCost += $item['quantity'] * $product->buying_price;

            $validatedItems[] = [
                ...$item,
                'product' => $product,
            ];
        }

        $discount = $data['discount'] ?? 0;
        $tax = $data['tax'] ?? 0;

        if ($discount > $subtotal) {
            throw new \Exception("Discount ({$discount}) cannot exceed subtotal ({$subtotal}).");
        }

        if (count($items) === 1) {
            $single = $items[0];
            $itemTotal = $single['quantity'] * $single['price'];
            if ($discount > $itemTotal) {
                throw new \Exception("Discount ({$discount}) cannot exceed product total ({$itemTotal}).");
            }
        }

        if (count($items) > 1) {
            $finalSellingAmount = $subtotal - $discount + $tax;
            if ($finalSellingAmount < $totalBuyingCost) {
                throw new \Exception("Invalid discount: Final selling price ({$finalSellingAmount}) is less than total buying cost ({$totalBuyingCost}).");
            }
        }

        return [$validatedItems, $subtotal, $totalBuyingCost];
    }
}
