<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use Inertia\Inertia;
use App\Models\Store;
use App\Models\Product;
use App\Models\SaleItem;
use App\Models\Inventory;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Models\StockMovement;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\StoreSaleRequest;
use App\Http\Resources\ProductResource;
use App\Models\Customer;

class SaleController extends Controller
{
    public function index()
    {
        $products = Product::query()
            ->with(['store', 'categories', 'creator', 'updator']);

        return Inertia::render('sales/Index', [
            'products' => ProductResource::collection($products->get()),
            'customers' => Customer::with('transactions')->get(),
            'payment_methods' => [],
        ]);
    }

    public function store(StoreSaleRequest $request)
    {
        $user = $request->user();
        $data = $request->validated();

        $sale = DB::transaction(function () use ($data, $user) {

            $storeId = $user->store_id
                ?? Store::firstWhere('name', 'Main')?->id;

            $sale = Sale::create([
                'invoice_number' => 'INV-' . strtoupper(Str::random(8)),
                'payment_method' => $data['payment_method'],
                'customer_type' => $data['customer_type'],
                'store_id' => $storeId,
                'user_id' => $user->id,
                'total' => 0,
            ]);

            $total = 0;
            $items = [];

            foreach ($data['items'] as $item) {
                $subtotal = $item['quantity'] * $item['unit_price'];
                $total += $subtotal;

                $items[] = new SaleItem([
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'subtotal' => $subtotal,
                ]);

                StockMovement::create([
                    'product_id' => $item['product_id'],
                    'store_id' => $storeId,
                    'user_id' => $user->id,
                    'type' => 'out',
                    'quantity' => -$item['quantity'],
                    'reason' => 'sale',
                    'reference_id' => $sale->id,
                ]);
            }

            $sale->items()->saveMany($items);
            $sale->update(['total' => $total]);

            return $sale->load(['user', 'customer', 'items.product']);
        });

        return Inertia::render('sales/Index', [
            'invoice' => $sale,
            'status' => true,
            'message' => 'Transaction completed successfully',
        ]);
    }

    public function show($id)
    {
        $sale = Sale::with([
            'items.product',
            'user',
            'customer',
            'store'
        ])->findOrFail($id);

        $invoice = [
            'id' => $sale->id,
            'invoice_number' => $sale->invoice_number,
            'type' => 'sale',
            'user' => $sale->user ? [
                'name' => $sale->user->name
            ] : null,
            'customer' => $sale->customer ? [
                'name' => $sale->customer->name
            ] : null,
            'payment_method' => $sale->payment_method,
            'status' => $sale->status ?? 'completed',
            'subtotal' => $sale->subtotal ?? $sale->total,
            'discount' => $sale->discount ?? 0,
            'tax' => $sale->tax ?? 0,
            'total' => $sale->total,
            'created_at' => $sale->created_at->toDateTimeString(),
            'items' => $sale->items->map(function ($item) {
                return [
                    'id' => $item->id,
                    'product_id' => $item->product_id,
                    'product_name' => $item->product->name ?? 'Unknown',
                    'product' => [
                        'name' => $item->product->name ?? 'Unknown',
                        'brand' => $item->product->brand ?? '',
                    ],
                    'quantity' => $item->quantity,
                    'unit_price' => $item->unit_price,
                    'price' => $item->unit_price,
                    'total' => $item->subtotal,
                ];
            })->toArray(),
        ];

        return response()->json([
            'inventory' => $invoice,
            'status' => true
        ]);
    }
}
