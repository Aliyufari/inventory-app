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
        $query = User::with(['role']);

        if ($search = request('search')) {
            $query->where('name', 'like', "%{$search}%")
                ->orWhereHas('role', fn($q) => $q->where('name', 'like', "%{$search}%"));
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
                'role' => [
                    'id' => $user->role->id,
                    'name' => $user->role->name,
                ],
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
            ]);

        if (request()->wantsJson()) {
            return response()->json(['users' => $users]);
        }

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

            $data['password'] = Hash::make($request->password);

            $user = User::create($data);

            event(new Registered($user));

            return redirect()->back()->with([
                'status' => true,
                'message' => 'User added successfully'
            ], JsonResponse::HTTP_CREATED);
        } catch (\Exception $e) {
            return redirect()->back()->withErrors([
                'status' => false,
                'errors' => $e->getMessage()
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

            $user->update($data);
            $user->refresh();

            return redirect()->back()->with([
                'status' => true,
                'message' => 'User added successfully'
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->withErrors([
                'status' => false,
                'errors' => $e->getMessage()
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
