<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Illuminate\Http\Request;
use App\Http\Resources\CustomerResource;

class CustomerController extends Controller
{
    public function list(Request $request)
    {
        $perPage = $request->get('per_page', 15);

        $customers = Customer::withCount('transactions')
            ->latest()
            ->paginate($perPage);

        return response()->json([
            'customers' => CustomerResource::collection($customers),
            'status' => true,
            'message' => 'Customers retrieved successfully'
        ]);
    }

    public function search(Request $request)
    {
        $query = $request->get('query', '');

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

        // Custom format for search (compatible with SearchableSelect)
        $formattedCustomers = $customers->map(function ($customer) {
            return [
                'value' => $customer->id,
                'label' => $customer->name,
                'name' => $customer->name,
                'email' => $customer->email,
                'type' => $customer->type,
                'phone' => $customer->phone,
            ];
        });

        return response()->json([
            'status' => true,
            'message' => 'Customers fetched successfully',
            'customers' => $formattedCustomers
        ]);
    }
}
