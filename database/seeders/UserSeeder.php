<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Superadmin (tanpa tenant)
        User::create([
            'name'      => 'Hadi Superadmin',
            'email'     => 'superadmin@londry.com',
            'password'  => Hash::make('password'),
            'role'      => 'superadmin',
            'tenant_id' => null,
        ]);

        // Admin untuk Clean Express Jambi (tenant_id = 1)
        User::create([
            'name'      => 'Aisyah Admin',
            'email'     => 'aisyah@londry.com',
            'password'  => Hash::make('password'),
            'role'      => 'admin_laundry',
            'tenant_id' => 1,
        ]);

        // Admin untuk Sparkle Laundry Kota (tenant_id = 2)
        User::create([
            'name'      => 'Budi Admin',
            'email'     => 'budi@londry.com',
            'password'  => Hash::make('password'),
            'role'      => 'admin_laundry',
            'tenant_id' => 2,
        ]);

        // Admin untuk FreshWash 24 Jam (tenant_id = 3)
        User::create([
            'name'      => 'Citra Admin',
            'email'     => 'citra@londry.com',
            'password'  => Hash::make('password'),
            'role'      => 'admin_laundry',
            'tenant_id' => 3,
        ]);
    }
}
