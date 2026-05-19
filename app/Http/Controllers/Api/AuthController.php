<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Login user dan kembalikan token + role.
     */
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Email atau password salah.'],
            ]);
        }

        // Blokir login jika status langganan tenant ditangguhkan/suspended
        if ($user->role !== 'superadmin' && $user->tenant) {
            $status = strtolower($user->tenant->status_langganan);
            if ($status === 'suspended' || $status === 'nonaktif' || $status === 'expired') {
                throw ValidationException::withMessages([
                    'email' => ['Akun laundry Anda ditangguhkan/diblokir sementara. Silakan hubungi Superadmin untuk informasi lebih lanjut.'],
                ]);
            }
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => [
                'id'           => $user->id,
                'name'         => $user->name,
                'email'        => $user->email,
                'role'         => $user->role,
                'tenant_id'    => $user->tenant_id,
                'nama_laundry' => $user->tenant?->nama_laundry,
            ],
        ]);
    }

    /**
     * Logout user (revoke token).
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out']);
    }
}
