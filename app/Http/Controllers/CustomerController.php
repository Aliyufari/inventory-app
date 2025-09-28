<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function list()
    {
        $customers = User::latest()
            ->get()
            ->map(fn($customer) => [
                'id' => $customer->id,
                'name' => $customer->name,
                'created_at' => $customer->created_at,
                'updated_at' => $customer->updated_at,
            ]);

        return response()->json([
            'customers' => $customers,
        ]);
    }

    public function search(Request $request)
    {
        $query = $request->get('query', '');

        $customers = User::whereHas('role', function ($q) {
            $q->where('name', 'customer');
        })
            ->where('name', 'like', "%{$query}%")
            ->limit(10)
            ->get(['id', 'name']);

        return response()->json([
            'status' => true,
            'message' => 'Customers fetched successfully',
            'customers' => $customers
        ]);
    }
}
