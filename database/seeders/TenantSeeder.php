<?php

namespace Database\Seeders;

use App\Models\Tenant;
use Illuminate\Database\Seeder;

class TenantSeeder extends Seeder
{
    public function run(): void
    {
        $tenants = [
            ['nama_laundry' => 'Clean Express Jambi',   'status_langganan' => 'aktif'],
            ['nama_laundry' => 'Sparkle Laundry Kota',  'status_langganan' => 'aktif'],
            ['nama_laundry' => 'FreshWash 24 Jam',      'status_langganan' => 'nonaktif'],
        ];

        foreach ($tenants as $tenant) {
            Tenant::create($tenant);
        }
    }
}
