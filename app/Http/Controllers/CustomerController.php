<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Illuminate\Http\Request;
use App\Http\Resources\CustomerResource;

class CustomerController extends Controller
{
    public function list(Request $request)
    {
        $customers = Customer::latest()
            ->get()
            ->map(fn($customer) => [
                'id' => $customer->id,
                'name' => $customer->name,
                'email' => $customer->email,
                'phone' => $customer->phone,
                'address' => $customer->address,
                'description' => $customer->description,
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
        dd($query);

        if (empty($query)) {
            return response()->json([
                'status' => true,
                'message' => 'Please provide a search query',
                'customers' => []
            ]);
        }

        $customers = Customer::where(function ($q) use ($query) {
            $q->where('name', 'like', "%{$query}%")
                ->orWhere('email', 'like', "%{$query}%")
                ->orWhere('phone', 'like', "%{$query}%")
                ->orWhere('type', 'like', "%{$query}%");
        })
            ->limit(10)
            ->get(['id', 'name']);

        $formattedCustomers = $customers->map(function ($customer) {
            return [
                'id' => $customer->id,
                'name' => $customer->name,
                'email' => $customer->email,
                'phone' => $customer->phone,
                'address' => $customer->address,
                'created_at' => $customer->created_at,
                'updated_at' => $customer->updated_at,
            ];
        });

        return response()->json([
            'status' => true,
            'message' => 'Customers fetched successfully',
            'customers' => $formattedCustomers
        ]);
    }
}
