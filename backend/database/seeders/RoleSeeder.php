<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        foreach ([
            ['name' => 'Admin', 'slug' => 'admin', 'description' => 'Full system access'],
            ['name' => 'Manager', 'slug' => 'manager', 'description' => 'Operational management access'],
            ['name' => 'Cashier', 'slug' => 'cashier', 'description' => 'POS and order processing access'],
            ['name' => 'Kitchen', 'slug' => 'kitchen', 'description' => 'Kitchen queue and preparation access'],
        ] as $role) {
            Role::updateOrCreate(['slug' => $role['slug']], $role);
        }
    }
}
