<?php

namespace App\Http\Controllers;

use App\Models\User;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Auth\Events\Registered;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use Illuminate\Http\JsonResponse;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $query = User::with(['role', 'stores']);

        // Handle search
        if ($search = request('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhereHas('role', fn($r) => $r->where('name', 'like', "%{$search}%"))
                    ->orWhereHas('stores', fn($s) => $s->where('name', 'like', "%{$search}%"));
            });
        }

        $users = $query->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn($user) => [
                'id' => $user->id,
                'avatar' => $user->avatar,
                'name' => $user->name,
                'email' => $user->email,
                'gender' => $user->gender,
                'status' => $user->status,
                'role' => $user->role ? [
                    'id' => $user->role->id,
                    'name' => $user->role->name,
                ] : null,
                'stores' => $user->stores->map(fn($store) => [
                    'id' => $store->id,
                    'name' => $store->name,
                ]),
                'created_at' => $user->created_at->toDateTimeString(),
                'updated_at' => $user->updated_at->toDateTimeString(),
            ]);

        // Handle API response
        if (request()->wantsJson()) {
            return response()->json(['users' => $users]);
        }

        // Inertia response
        return Inertia::render('users/Index', [
            'users' => $users,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreUserRequest $request)
    {
        try {
            $data = $request->validated();

            // Hash password
            $data['password'] = Hash::make($request->password);

            // Create the user
            $user = User::create($data);

            // Attach selected stores (if any)
            if ($request->filled('store_ids')) {
                $user->stores()->attach($request->store_ids);
            }

            // Fire Registered event
            event(new Registered($user));

            // Respond success
            return redirect()->back()->with([
                'status' => true,
                'message' => 'User added successfully',
            ]);
        } catch (\Exception $e) {
            // Respond error
            return redirect()->back()->withErrors([
                'status' => false,
                'errors' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        try {
            return redirect()->back()->with([
                'status' => true,
                'message' => 'User fetched successfully',
                'user' => $user
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->withErrors([
                'status' => false,
                'errors' => $e->getMessage()
            ]);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateUserRequest $request, User $user)
    {
        try {
            $data = $request->validated();

            // Update user fields
            $user->update($data);

            // Sync the attached stores (replace old with new)
            if ($request->filled('store_ids')) {
                $user->stores()->sync($request->store_ids);
            } else {
                // If no stores provided, detach all
                $user->stores()->detach();
            }

            $user->refresh();

            return redirect()->back()->with([
                'status' => true,
                'message' => 'User updated successfully',
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->withErrors([
                'status' => false,
                'errors' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        try {
            $user->delete();

            return response()->json([
                'status' => true,
                'message' => 'User deleted successfully',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
