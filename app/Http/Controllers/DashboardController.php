<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\User;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
    public function index()
    {
        try {
            $shortages = Product::where('quantity', '<=', 10)->count();

            $statistics = [
                'total_users' => User::count(),
                'total_products' => Product::count(),
                'total_categories' => Category::count(),
                'product_shortage' => $shortages,
            ];

            Log::info('Statistics:', $statistics);

            return Inertia::render('Dashboard', [
                'statistics' => $statistics,
            ]);
        } catch (\Throwable $e) {
            Log::info('Error: ', $e);
        }
    }
}
