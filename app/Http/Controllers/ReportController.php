<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Invoice;
use App\Models\Product;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function salesReport(Request $request)
    {
        $start = $request->input('start_date', now()->startOfMonth());
        $end   = $request->input('end_date', now()->endOfMonth());

        $sales = Invoice::whereBetween('invoice_date', [$start, $end])
            ->where('status', 'completed')
            ->with('customer')
            ->get();

        $totalSales = $sales->sum('total');

        return Inertia::render('reports/Sales', [
            'sales' => $sales,
            'totalSales' => $totalSales,
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
}
