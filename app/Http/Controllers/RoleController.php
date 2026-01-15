<?php

namespace App\Http\Controllers;

use App\Models\Role;
use Illuminate\Http\JsonResponse;

class RoleController extends Controller
{
    public function index(): JsonResponse
    {
        $authUser = auth()->user();

        if ($authUser->role === 'super') {
            $roles = Role::all();
        } else {
            $roles = Role::whereIn('name', ['admin', 'user'])->get();
        }

        return response()->json([
            'status' => true,
            'roles' => $roles,
        ]);
    }
}
