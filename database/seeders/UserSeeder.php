<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $role = Role::firstOrCreate(['name' => 'super']);

        User::firstOrCreate([
            'name' => 'Alameen Pharmacy',
            'email' => 'ap@email.com',
            'gender' => 'male',
            'status' => 'active',
            'password' => Hash::make('password'),
            'role_id' => $role->id,
        ]);
    }
}
