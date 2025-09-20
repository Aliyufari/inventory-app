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
        $users = User::paginate(10)->through(fn($user) => [
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
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
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

            // return to_route('users.index');

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
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateUserRequest $request, User $user)
    {
        try {
            $data = $request->validated();

            $data['password'] = Hash::make($request->password);

            $user->update($data);
            $user->refresh();

            // return to_route('users.index');

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

            return redirect()->back()->with([
                'status' => true,
                'message' => 'User deleted successfully'
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->withErrors([
                'status' => false,
                'errors' => $e->getMessage()
            ]);
        }
    }
}
