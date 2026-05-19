<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\Request;

class SuperadminController extends Controller
{
    /**
     * Mengembalikan data statistik global untuk Superadmin.
     */
    public function index()
    {
        $activeTenants = Tenant::whereIn('status_langganan', ['active', 'aktif'])->count();
        $suspendedTenants = Tenant::whereIn('status_langganan', ['suspended', 'nonaktif', 'expired'])->count();
        $totalVolume = Order::withoutGlobalScopes()->sum('total_harga');

        return response()->json([
            'total_active_tenants'    => $activeTenants,
            'total_suspended_tenants' => $suspendedTenants,
            'total_transaction_volume' => (float) $totalVolume,
        ]);
    }

    /**
     * Menampilkan daftar semua laundry yang bergabung.
     */
    public function manageTenants()
    {
        $tenants = Tenant::with(['users' => function ($query) {
            $query->where('role', 'admin_laundry');
        }])->latest()->get();

        $data = $tenants->map(function ($tenant) {
            $admin = $tenant->users->first();
            return [
                'id'               => $tenant->id,
                'nama_laundry'     => $tenant->nama_laundry,
                'pemilik'          => $admin ? $admin->name : 'Tidak Ada Pemilik',
                'email_admin'      => $admin ? $admin->email : 'Tidak Ada Email',
                'status_langganan' => $tenant->status_langganan,
                'tanggal_daftar'   => $tenant->created_at->toIso8601String(),
            ];
        });

        return response()->json($data);
    }

    /**
     * Mengubah status_langganan tenant menjadi 'active' atau 'suspended'.
     */
    public function toggleStatus($id)
    {
        $tenant = Tenant::findOrFail($id);

        $currentStatus = strtolower($tenant->status_langganan);
        $newStatus = ($currentStatus === 'active' || $currentStatus === 'aktif') ? 'suspended' : 'active';

        $tenant->status_langganan = $newStatus;
        $tenant->save();

        return response()->json([
            'message'          => "Status langganan tenant {$tenant->nama_laundry} berhasil diubah menjadi {$newStatus}.",
            'tenant_id'        => $tenant->id,
            'status_langganan' => $newStatus,
        ]);
    }

    /**
     * Mendaftarkan mitra laundry baru (Tenant + Admin User).
     */
    public function registerTenant(Request $request)
    {
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'nama_laundry' => 'required|string|max:255',
            'name'         => 'required|string|max:255',
            'email'        => 'required|string|email|max:255|unique:users',
            'password'     => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        // 1. Create Tenant
        $tenant = Tenant::create([
            'nama_laundry'     => $request->nama_laundry,
            'status_langganan' => 'active',
        ]);

        // 2. Create Admin User for this Tenant
        $user = User::create([
            'name'      => $request->name,
            'email'     => $request->email,
            'password'  => \Illuminate\Support\Facades\Hash::make($request->password),
            'role'      => 'admin_laundry',
            'tenant_id' => $tenant->id,
        ]);

        return response()->json([
            'message' => 'Mitra laundry baru berhasil didaftarkan.',
            'tenant'  => $tenant,
            'user'    => $user,
        ], 201);
    }

    /**
     * Reset password admin dari suatu tenant.
     */
    public function resetPassword(Request $request, $id)
    {
        $tenant = Tenant::findOrFail($id);
        $admin = User::where('tenant_id', $tenant->id)->where('role', 'admin_laundry')->first();

        if (!$admin) {
            return response()->json([
                'message' => 'Admin untuk laundry ini tidak ditemukan.'
            ], 404);
        }

        $request->validate([
            'password' => 'required|string|min:6',
        ], [
            'password.required' => 'Password baru wajib diisi.',
            'password.min' => 'Password baru minimal 6 karakter.'
        ]);

        $admin->password = \Illuminate\Support\Facades\Hash::make($request->password);
        $admin->save();

        return response()->json([
            'message' => "Password admin untuk laundry {$tenant->nama_laundry} ({$admin->name}) berhasil direset."
        ]);
    }
}
