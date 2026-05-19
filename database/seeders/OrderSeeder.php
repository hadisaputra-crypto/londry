<?php

namespace Database\Seeders;

use App\Models\Order;
use Illuminate\Database\Seeder;

class OrderSeeder extends Seeder
{
    public function run(): void
    {
        $orders = [
            // === Clean Express Jambi (tenant_id = 1) ===
            ['tenant_id' => 1, 'nomor_nota' => 'ORD-20250518-001', 'berat_cucian' => 3.20, 'status_cucian' => 'cuci'],
            ['tenant_id' => 1, 'nomor_nota' => 'ORD-20250518-002', 'berat_cucian' => 5.00, 'status_cucian' => 'proses'],
            ['tenant_id' => 1, 'nomor_nota' => 'ORD-20250518-003', 'berat_cucian' => 2.10, 'status_cucian' => 'siap_diambil'],
            ['tenant_id' => 1, 'nomor_nota' => 'ORD-20250517-004', 'berat_cucian' => 4.50, 'status_cucian' => 'setrika'],

            // === Sparkle Laundry Kota (tenant_id = 2) ===
            ['tenant_id' => 2, 'nomor_nota' => 'ORD-20250518-005', 'berat_cucian' => 1.80, 'status_cucian' => 'siap_diambil'],
            ['tenant_id' => 2, 'nomor_nota' => 'ORD-20250518-006', 'berat_cucian' => 6.30, 'status_cucian' => 'proses'],
            ['tenant_id' => 2, 'nomor_nota' => 'ORD-20250517-007', 'berat_cucian' => 3.75, 'status_cucian' => 'cuci'],

            // === FreshWash 24 Jam (tenant_id = 3) ===
            ['tenant_id' => 3, 'nomor_nota' => 'ORD-20250518-008', 'berat_cucian' => 7.00, 'status_cucian' => 'proses'],
            ['tenant_id' => 3, 'nomor_nota' => 'ORD-20250517-009', 'berat_cucian' => 2.50, 'status_cucian' => 'setrika'],
            ['tenant_id' => 3, 'nomor_nota' => 'ORD-20250516-010', 'berat_cucian' => 4.00, 'status_cucian' => 'siap_diambil'],
        ];

        foreach ($orders as $order) {
            Order::withoutGlobalScopes()->create($order);
        }
    }
}
