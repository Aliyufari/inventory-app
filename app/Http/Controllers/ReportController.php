<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Models\User;
use Inertia\Inertia;
use App\Models\Store;
use App\Models\Invoice;
use App\Models\Product;
use App\Models\Customer;
use Illuminate\Http\Request;
use App\Models\StockMovement;
use Illuminate\Support\Carbon;

class ReportController extends Controller
{
    public function salesReport(Request $request)
    {
        $query = Sale::query()
            ->with([
                'user:id,name',
                'customer:id,name',
                'store:id,name',
                'items:id,sale_id,subtotal'
            ]);

        /* ============================
    | Date Filters
    |============================ */
        if ($request->filled('from')) {
            $query->whereDate('created_at', '>=', Carbon::parse($request->from));
        }

        if ($request->filled('to')) {
            $query->whereDate('created_at', '<=', Carbon::parse($request->to));
        }

        /* ============================
    | Optional Filters
    |============================ */
        if ($request->filled('store_id')) {
            $query->where('store_id', $request->store_id);
        }

        if ($request->filled('customer_id')) {
            $query->where('customer_id', $request->customer_id);
        }

        if ($request->filled('payment_method')) {
            $query->where('payment_method', $request->payment_method);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        /* ============================
    | Sorting
    |============================ */
        $query->orderBy(
            $request->get('sort_by', 'created_at'),
            $request->get('sort_dir', 'desc')
        );

        /* ============================
    | Aggregates
    |============================ */
        $summary = (clone $query)->selectRaw('
        COUNT(*) as total_sales,
        SUM(total) as gross_total,
        SUM(discount) as total_discount,
        SUM(tax) as total_tax
    ')->first();

        /* ============================
    | Paginated Sales
    |============================ */
        $sales = $query
            ->paginate($request->get('per_page', 10))
            ->withQueryString();

        /* ============================
    | Subtotal from items
    |============================ */
        $subtotal = $sales->getCollection()->sum(
            fn($sale) => $sale->subtotal
        );

        return Inertia::render('reports/SalesReport', [
            /* ============================
        | Report Data
        |============================ */
            'sales' => $sales,

            'summary' => [
                'total_sales'    => (int) $summary->total_sales,
                'subtotal'       => round($subtotal, 2),
                'gross_total'    => round($summary->gross_total, 2),
                'total_discount' => round($summary->total_discount, 2),
                'total_tax'      => round($summary->total_tax, 2),
                'net_total'      => round(
                    ($summary->gross_total - $summary->total_discount + $summary->total_tax),
                    2
                ),
            ],

            /* ============================
        | Current Filters
        |============================ */
            'filters' => $request->only([
                'from',
                'to',
                'store_id',
                'customer_id',
                'payment_method',
                'status',
                'user_id',
                'sort_by',
                'sort_dir',
                'per_page',
            ]),

            /* ============================
        | Filter Entities
        |============================ */
            'stores' => Store::select('id', 'name')->orderBy('name')->get(),
            'customers' => Customer::select('id', 'name')->orderBy('name')->get(),
            'users' => User::select('id', 'name')->orderBy('name')->get(),

            'payment_methods' => [
                'cash',
                'card',
                'transfer',
                'pos',
                'wallet',
            ],

            'statuses' => [
                'completed',
                'pending',
                'cancelled',
                'refunded',
            ],
        ]);
    }

    public function inventoryReport()
    {
        $products = Product::select('id', 'name', 'quantity', 'price')
            ->orderBy('name')
            ->get();

        return Inertia::render('reports/Inventory', [
            'products' => $products,
        ]);
    }

    public function profitReport(Request $request)
    {
        $start = $request->input('start_date', now()->startOfMonth());
        $end   = $request->input('end_date', now()->endOfMonth());

        $sales = Invoice::whereBetween('invoice_date', [$start, $end])
            ->where('status', 'completed')
            ->get();

        $revenue = $sales->sum('total');
        $costs   = $sales->sum(function ($invoice) {
            return $invoice->items->sum(function ($item) {
                return $item->quantity * ($item->product->cost_price ?? 0);
            });
        });

        $profit = $revenue - $costs;

        return Inertia::render('reports/Profit', [
            'revenue' => $revenue,
            'costs'   => $costs,
            'profit'  => $profit,
        ]);
    }

    public function dailySales()
    {
        return Sale::whereDate('created_at', Carbon::today())
            ->sum('total');
    }

    public function stockHistory($productId)
    {
        return StockMovement::where('product_id', $productId)
            ->latest()
            ->get();
    }
}
