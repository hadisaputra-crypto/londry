<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Scopes\TenantScope;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Order::with('member', 'orderDetails.service');

        if ($request->filled('search')) {
            $search = strtolower(trim($request->query('search')));
            $query->where(function ($q) use ($search) {
                $q->whereRaw('LOWER(nomor_nota) like ?', ["%{$search}%"])
                  ->orWhere('created_at', 'like', "%{$search}%")
                  ->orWhereHas('member', function ($m) use ($search) {
                      $m->whereRaw('LOWER(nama) like ?', ["%{$search}%"]);
                  });
            });
        }

        $orders = $query->latest()->get();

        return response()->json([
            'success' => true,
            'data'    => $orders,
        ]);
    }

    /**
     * Simpan order baru berserta order details.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'member_id' => 'nullable|exists:members,id',
            'total_harga' => 'required|numeric|min:0',
            'items' => 'required|array|min:1',
            'items.*.service_id' => 'required|exists:services,id',
            'items.*.qty' => 'required|numeric|min:0.1',
            'items.*.subtotal' => 'required|numeric|min:0'
        ]);

        try {
            DB::beginTransaction();

            // 1. Buat Header Order
            $order = Order::create([
                'member_id' => $validated['member_id'],
                'nomor_nota' => 'INV-' . time() . '-' . rand(100, 999),
                'total_harga' => $validated['total_harga'],
                'status_cucian' => 'proses',
                // berat_cucian diabaikan karena sekarang multi-service pakai qty di details
            ]);

            // 2. Buat Order Details (Items)
            foreach ($validated['items'] as $item) {
                $order->orderDetails()->create([
                    'service_id' => $item['service_id'],
                    'qty' => $item['qty'],
                    'subtotal' => $item['subtotal']
                ]);
            }

            // 3. Tambah Poin Member jika ada member_id
            if ($order->member_id && $order->member) {
                // Contoh: Setiap kelipatan 10.000 dapat 1 poin
                $addedPoin = floor($order->total_harga / 10000);
                $order->member->increment('poin', $addedPoin);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Order berhasil dibuat.',
                'data'    => $order->load('orderDetails.service', 'member'),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal menyimpan order: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update order berserta order details.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'member_id' => 'nullable|exists:members,id',
            'total_harga' => 'required|numeric|min:0',
            'items' => 'required|array|min:1',
            'items.*.service_id' => 'required|exists:services,id',
            'items.*.qty' => 'required|numeric|min:0.1',
            'items.*.subtotal' => 'required|numeric|min:0'
        ]);

        try {
            DB::beginTransaction();

            $order = Order::with('member')->findOrFail($id);
            $oldTotal = $order->total_harga;
            $oldMemberId = $order->member_id;

            // 1. Update Header Order
            $order->update([
                'member_id' => $validated['member_id'],
                'total_harga' => $validated['total_harga'],
            ]);

            // 2. Re-create Order Details (Items)
            $order->orderDetails()->delete();
            foreach ($validated['items'] as $item) {
                $order->orderDetails()->create([
                    'service_id' => $item['service_id'],
                    'qty' => $item['qty'],
                    'subtotal' => $item['subtotal']
                ]);
            }

            // 3. Sesuaikan Poin Member
            $newPoin = floor($validated['total_harga'] / 10000);
            $oldPoin = floor($oldTotal / 10000);

            if ($oldMemberId == $validated['member_id']) {
                if ($oldMemberId) {
                    $diffPoin = $newPoin - $oldPoin;
                    if ($diffPoin != 0) {
                        $order->member()->increment('poin', $diffPoin);
                    }
                }
            } else {
                // Kurangi dari member lama jika ada
                if ($oldMemberId) {
                    \App\Models\Member::where('id', $oldMemberId)->decrement('poin', $oldPoin);
                }
                // Tambah ke member baru jika ada
                if ($validated['member_id']) {
                    \App\Models\Member::where('id', $validated['member_id'])->increment('poin', $newPoin);
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Order berhasil diperbarui.',
                'data'    => $order->load('orderDetails.service', 'member'),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui order: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update status cucian.
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'status_cucian' => 'required|in:proses,cuci,setrika,siap_diambil',
        ]);

        $order = Order::findOrFail($id);

        $order->update([
            'status_cucian' => $validated['status_cucian'],
        ]);

        if ($validated['status_cucian'] === 'siap_diambil') {
            $this->sendWhatsAppNotification($order);
        }

        return response()->json([
            'success' => true,
            'message' => 'Status berhasil diperbarui.',
            'data'    => $order->fresh(),
        ]);
    }

    /**
     * Tampilkan detail order.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $order = Order::with(['member', 'orderDetails.service'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data'    => $order,
        ]);
    }

    /**
     * Hapus order.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $order = Order::findOrFail($id);
        $order->delete();

        return response()->json([
            'success' => true,
            'message' => 'Order berhasil dihapus.',
        ]);
    }

    /**
     * Track Order by nomor_nota (Public API)
     */
    public function track(string $nomor_nota): JsonResponse
    {
        $nomor_nota = strtolower(trim($nomor_nota));
        // Cari order berdasarkan nomor nota (bypass TenantScope karena ini API publik)
        $order = Order::withoutGlobalScope(TenantScope::class)
            ->with(['member', 'tenant'])
            ->whereRaw('LOWER(nomor_nota) = ?', [$nomor_nota])
            ->first();

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Pesanan tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'nomor_nota' => $order->nomor_nota,
                'nama_pelanggan' => $order->member ? $order->member->nama : 'Umum',
                'nama_laundry' => $order->tenant ? $order->tenant->nama_laundry : '-',
                'status_cucian' => $order->status_cucian,
                'berat_cucian' => $order->berat_cucian ?? '-',
                'total_biaya' => $order->total_harga,
            ]
        ]);
    }

    /**
     * Trigger notifikasi WhatsApp
     */
    private function sendWhatsAppNotification(Order $order): void
    {
        // Pastikan relasi member & tenant termuat
        $order->loadMissing(['member', 'tenant']);

        $phone = $order->member ? $order->member->nomor_hp : null;
        if (!$phone) {
            return; // Tidak ada nomor HP
        }

        $nama = $order->member->nama;
        $nota = $order->nomor_nota;
        $laundry = $order->tenant ? $order->tenant->nama_laundry : 'LaundryKu';

        $message = "Halo {$nama},\n\nCucian Anda dengan nomor nota *{$nota}* sudah *SIAP DIAMBIL* di {$laundry}.\n\nTerima kasih!";

        // TODO: Integrasikan dengan API WhatsApp (contoh: Twilio, Watzap, Fonnte, dsb)
        // \Illuminate\Support\Facades\Http::post('API_URL', ['phone' => $phone, 'message' => $message]);
        
        Log::info("WhatsApp Notification terpicu untuk pesanan {$nota} ke nomor {$phone}: {$message}");
    }
}
