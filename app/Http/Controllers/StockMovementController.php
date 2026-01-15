<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\StockMovement;
use App\Http\Requests\StoreStockMovementRequest;
use Inertia\Inertia;

class StockMovementController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $stock_movement = StockMovement::with('product')
            ->latest()
            ->paginate(20);

        return Inertia::render('', [
            'stock_movement' => $stock_movement
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreStockMovementRequest $request)
    {
        $data = $request->validated();

        if ($data['type'] === 'out') {
            $data['quantity'] = -abs($data['quantity']);
        }

        if ($data['type'] === 'in') {
            $data['quantity'] = abs($data['quantity']);
        }

        $data['user_id'] = auth()->id();

        return StockMovement::create($data);
    }
}
