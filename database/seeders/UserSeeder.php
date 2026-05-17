<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Role::create(["name" => "admin"]);
        Role::create(["name" => "staff"]);
        Role::create(["name" => "manager"]);

        $user = User::create([
            'name' => 'Hussein Khamis',
            'password' => '12345',
            'username' => 'huss',
            'email' => 'info@softduka.com'
        ]);

        $user->assignRole('admin');
    }
}
