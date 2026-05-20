<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Registrasi karyawan oleh Admin Laundry.
     */
    public function registerKaryawan(Request $request)
    {
        $admin = $request->user();

        // Validasi bahwa pengakses adalah admin_laundry
        if ($admin->role !== 'admin_laundry') {
            return response()->json([
                'message' => 'Hanya Admin Laundry yang dapat mendaftarkan karyawan.'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'role' => ['required', Rule::in(['kasir', 'produksi'])],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'tenant_id' => $admin->tenant_id, // otomatis disamakan dengan tenant_id milik Admin
        ]);

        return response()->json([
            'message' => 'Karyawan berhasil didaftarkan.',
            'user' => $user
        ], 201);
    }

    /**
     * Tampilkan daftar karyawan milik tenant ini.
     */
    public function index(Request $request)
    {
        $admin = $request->user();

        if ($admin->role !== 'admin_laundry') {
            return response()->json([
                'message' => 'Hanya Admin Laundry yang dapat melihat daftar karyawan.'
            ], 403);
        }

        $employees = User::where('tenant_id', $admin->tenant_id)
            ->whereIn('role', ['kasir', 'produksi'])
            ->get();

        return response()->json($employees);
    }

    /**
     * Hapus akses / pecat karyawan.
     */
    public function destroy(Request $request, $id)
    {
        $admin = $request->user();

        if ($admin->role !== 'admin_laundry') {
            return response()->json([
                'message' => 'Hanya Admin Laundry yang dapat mencabut akses karyawan.'
            ], 403);
        }

        $employee = User::where('tenant_id', $admin->tenant_id)
            ->whereIn('role', ['kasir', 'produksi'])
            ->findOrFail($id);

        $employee->delete();

        return response()->json([
            'message' => 'Akses karyawan berhasil dicabut.'
        ]);
    }

    /**
     * Update profil dan ganti password sendiri.
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'nama_laundry' => 'nullable|string|max:255',
            'old_password' => 'nullable|required_with:password|string',
            'password' => 'nullable|string|min:6|confirmed',
        ], [
            'old_password.required_with' => 'Password lama wajib diisi untuk mengubah password.',
            'password.confirmed' => 'Konfirmasi password baru tidak cocok.',
            'password.min' => 'Password baru minimal 6 karakter.'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        // Cek password lama jika ingin mengubah password
        if ($request->filled('password')) {
            if (!Hash::check($request->old_password, $user->password)) {
                return response()->json([
                    'errors' => [
                        'old_password' => ['Password lama yang Anda masukkan salah.']
                    ]
                ], 422);
            }
            $user->password = Hash::make($request->password);
        }

        $user->name = $request->name;
        $user->email = $request->email;
        $user->save();

        // Jika dia adalah admin_laundry dan dia mengirimkan nama_laundry, update juga nama laundry tenant-nya!
        if ($user->role === 'admin_laundry' && $request->filled('nama_laundry') && $user->tenant) {
            $tenant = $user->tenant;
            $tenant->nama_laundry = $request->nama_laundry;
            $tenant->save();
        }

        return response()->json([
            'message' => 'Profil berhasil diperbarui.',
            'user' => [
                'id'           => $user->id,
                'name'         => $user->name,
                'email'        => $user->email,
                'role'         => $user->role,
                'tenant_id'    => $user->tenant_id,
                'nama_laundry' => $user->tenant?->nama_laundry,
            ]
        ]);
    }
}
