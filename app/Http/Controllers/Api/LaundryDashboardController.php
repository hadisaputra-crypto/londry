<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;

class LaundryDashboardController extends Controller
{
    /**
     * Statistik order per status (auto-filter by tenant via TenantScope).
     */
    public function stats(Request $request)
    {
        return response()->json([
            'proses'       => Order::where('status_cucian', 'proses')->count(),
            'cuci'         => Order::where('status_cucian', 'cuci')->count(),
            'setrika'      => Order::where('status_cucian', 'setrika')->count(),
            'siap_diambil' => Order::where('status_cucian', 'siap_diambil')->count(),
            'total'        => Order::count(),
        ]);
    }

    /**
     * Daftar pesanan terbaru (auto-filter by tenant via TenantScope).
     */
    public function recentOrders()
    {
        $orders = Order::latest()->limit(10)->get();

        return response()->json($orders);
    }
}
