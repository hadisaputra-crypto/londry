<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\LaundryDashboardController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\SuperadminDashboardController;
use App\Http\Controllers\Api\SuperadminController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// === Auth Routes (public) ===
Route::post('/login', [AuthController::class, 'login']);

// === Public Tracking Route ===
Route::get('/v1/public/track/{nomor_nota}', [OrderController::class, 'track']);

// === Authenticated Routes ===
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/user', function (Request $request) {
        $user = $request->user();
        return response()->json([
            'id'           => $user->id,
            'name'         => $user->name,
            'email'        => $user->email,
            'role'         => $user->role,
            'tenant_id'    => $user->tenant_id,
            'nama_laundry' => $user->tenant?->nama_laundry,
        ]);
    });
    Route::put('/profile', [\App\Http\Controllers\Api\UserController::class, 'updateProfile']);

    // === Employee Management (Admin only) ===
    Route::get('/karyawan', [\App\Http\Controllers\Api\UserController::class, 'index'])
        ->middleware('role:admin_laundry');
    Route::post('/karyawan/register', [\App\Http\Controllers\Api\UserController::class, 'registerKaryawan'])
        ->middleware('role:admin_laundry');
    Route::delete('/karyawan/{id}', [\App\Http\Controllers\Api\UserController::class, 'destroy'])
        ->middleware('role:admin_laundry');

    // === Superadmin Dashboard (Protected) ===
    Route::prefix('superadmin')->middleware('role:superadmin')->group(function () {
        Route::get('/stats',            [SuperadminController::class, 'index']);
        Route::get('/tenants',          [SuperadminController::class, 'manageTenants']);
        Route::post('/tenants',         [SuperadminController::class, 'registerTenant']);
        Route::post('/tenants/{id}/toggle', [SuperadminController::class, 'toggleStatus']);
        Route::post('/tenants/{id}/reset-password', [SuperadminController::class, 'resetPassword']);
    });

    // === Laundry Dashboard (tenant-scoped) ===
    Route::prefix('laundry')->group(function () {
        Route::get('/stats',         [LaundryDashboardController::class, 'stats']);
        Route::get('/recent-orders', [LaundryDashboardController::class, 'recentOrders']);
    });

    // === Order CRUD ===
    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::put('/orders/{id}', [OrderController::class, 'update']);
    Route::patch('/orders/{id}/status', [OrderController::class, 'updateStatus'])
        ->middleware('role:admin_laundry,kasir,produksi');
    Route::delete('/orders/{id}', [OrderController::class, 'destroy']);

    // === Members & Services (tenant-scoped) ===
    Route::apiResource('members', \App\Http\Controllers\Api\MemberController::class);
    Route::apiResource('services', \App\Http\Controllers\Api\ServiceController::class);
});
