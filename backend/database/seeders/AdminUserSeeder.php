<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $adminRole = Role::where('slug', 'admin')->firstOrFail();

        User::updateOrCreate(
            ['username' => 'admin'],
            [
                'role_id' => $adminRole->id,
                'name' => 'System Admin',
                'email' => 'admin@restaurant-pos.test',
                'password' => 'password123',
                'is_active' => true,
            ]
        );
    }
}
