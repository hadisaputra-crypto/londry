<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    public function index(Request $request)
    {
        // TenantScope automatically filters by auth user's tenant
        $services = Service::latest()->get();
        return response()->json($services);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_layanan' => 'required|string|max:255',
            'jenis_layanan' => 'required|in:kiloan,satuan',
            'harga_per_unit' => 'required|numeric|min:0',
            'satuan_unit' => 'required|string|max:20'
        ]);

        $validated['tenant_id'] = $request->user()->tenant_id;

        $service = Service::create($validated);

        return response()->json($service, 201);
    }

    public function update(Request $request, Service $service)
    {
        if ($service->tenant_id !== $request->user()->tenant_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'nama_layanan' => 'sometimes|required|string|max:255',
            'jenis_layanan' => 'sometimes|required|in:kiloan,satuan',
            'harga_per_unit' => 'sometimes|required|numeric|min:0',
            'satuan_unit' => 'sometimes|required|string|max:20'
        ]);

        $service->update($validated);

        return response()->json($service);
    }

    public function destroy(Request $request, Service $service)
    {
        if ($service->tenant_id !== $request->user()->tenant_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $service->delete();

        return response()->json(['message' => 'Service deleted successfully']);
    }
}
