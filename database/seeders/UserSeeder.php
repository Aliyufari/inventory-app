<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use App\Models\Store;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $role = Role::firstOrCreate(['name' => 'super']);
        $stores = Store::all();

        $user = User::firstOrCreate([
            'name' => 'Alameen Pharmacy',
            'email' => 'ap@email.com',
            'gender' => 'male',
            'status' => 'active',
            'password' => Hash::make('password'),
            'role_id' => $role->id,
        ]);

        if ($stores->isNotEmpty() && method_exists($user, 'stores')) {
            $user->stores()->syncWithoutDetaching($stores->pluck('id')->toArray());
        }
    }
}
