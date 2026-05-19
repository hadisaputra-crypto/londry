<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Tenant;
use App\Models\User;

class SuperadminDashboardController extends Controller
{
    /**
     * Statistik global untuk superadmin.
     */
    public function stats()
    {
        return response()->json([
            'total_tenants' => Tenant::count(),
            'total_users'   => User::count(),
            'total_orders'  => Order::withoutGlobalScopes()->count(),
        ]);
    }

    /**
     * Daftar semua tenant beserta jumlah user & order.
     */
    public function tenants()
    {
        $tenants = Tenant::withCount(['users', 'orders'])->latest()->get();

        return response()->json($tenants);
    }

    /**
     * Daftar semua order (lintas tenant) untuk superadmin.
     */
    public function orders()
    {
        $orders = Order::withoutGlobalScopes()
            ->with('tenant:id,nama_laundry')
            ->latest()
            ->limit(20)
            ->get();

        return response()->json($orders);
    }
}
