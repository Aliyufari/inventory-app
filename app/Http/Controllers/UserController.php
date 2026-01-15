<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\User;
use Inertia\Inertia;
use App\Models\Store;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use App\Http\Resources\UserResource;
use Illuminate\Support\Facades\Hash;
use Illuminate\Auth\Events\Registered;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $query = User::with(['role', 'stores']);

            // Exclude super, owner, and self
            $query->whereDoesntHave('role', function ($q) {
                $q->whereIn('name', ['super', 'owner']);
            })
                ->where('id', '!=', auth()->id());

            // Search filter
            if ($search = request('search')) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhereHas('role', fn($r) => $r->where('name', 'like', "%{$search}%"))
                        ->orWhereHas('stores', fn($s) => $s->where('name', 'like', "%{$search}%"));
                });
            }

            // Role filter
            if ($role = request('role')) {
                if ($role !== 'all') {
                    $query->whereHas('role', fn($r) => $r->where('id', $role));
                }
            }

            // Status filter
            if (request()->filled('status') && request('status') !== 'all') {
                $query->where('status', filter_var(request('status'), FILTER_VALIDATE_BOOLEAN));
            }

            $users = $query->latest()->paginate(15)->withQueryString();

            // API response
            if (request()->wantsJson()) {
                return UserResource::collection($users);
            }

            // Inertia response
            return Inertia::render('users/Index', [
                'data' => UserResource::collection($users),
                'roles' => Role::all(),
                'stores' => Store::all(),
            ]);
        } catch (\Throwable $e) {
            Log::error('Error retrieving users', [
                'message' => $e->getMessage(),
            ]);

            return back()->withErrors([
                'message' => 'Error retrieving users.',
            ]);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreUserRequest $request)
    {
        try {
            $data = $request->validated();
            $data['password'] = Hash::make($request->password);
            $user = User::create($data);

            if ($request->filled('store_ids')) {
                $user->stores()->attach($request->store_ids);
            }

            event(new Registered($user));

            return back()->with([
                'status' => true,
                'message' => 'User added successfully',
            ]);
        } catch (\Throwable $e) {
            return back()->withErrors([
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
            return back()->with([
                'status' => true,
                'message' => 'User fetched successfully',
                'user' => $user
            ]);
        } catch (\Throwable $e) {
            return back()->withErrors([
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

            return back()->with([
                'status' => true,
                'message' => 'User updated successfully',
            ]);
        } catch (\Throwable $e) {
            return back()->withErrors([
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

            return back()->with([
                'status' => true,
                'message' => 'User deleted successfully',
            ], 200);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
