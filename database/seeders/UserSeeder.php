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
        $super = Role::firstOrCreate(['name' => 'super']);
        $owner = Role::firstOrCreate(['name' => 'owner']);
        $admin = Role::firstOrCreate(['name' => 'admin']);
        $user = Role::firstOrCreate(['name' => 'user']);

        $stores = Store::all();

        $superUser = User::firstOrCreate([
            'name' => 'Aliyu Abubakar',
            'email' => 'aliyufari@gmail.com',
            'gender' => 'male',
            'status' => true,
            'password' => Hash::make('password'),
            'role_id' => $super->id,
        ]);

        $ownerUser = User::firstOrCreate([
            'name' => 'Mukhtar Shehu',
            'email' => 'mukhtarshehu@gmail.com',
            'gender' => 'male',
            'status' => true,
            'password' => Hash::make('password'),
            'role_id' => $owner->id,
        ]);

        $adminUser = User::firstOrCreate([
            'name' => 'Hussaini',
            'email' => 'hussaini@gmail.com',
            'gender' => 'male',
            'status' => true,
            'password' => Hash::make('password'),
            'role_id' => $admin->id,
        ]);

        $normalUser = User::firstOrCreate([
            'name' => 'User',
            'email' => 'user@email.com',
            'gender' => 'male',
            'status' => true,
            'password' => Hash::make('password'),
            'role_id' => $user->id,
        ]);

        if ($stores->isNotEmpty()) {
            if ($stores->isNotEmpty()) {
                foreach ([$superUser, $ownerUser, $adminUser, $normalUser] as $user) {
                    $user->stores()->syncWithoutDetaching($stores->pluck('id')->toArray());
                }
            }
        }
    }
}
