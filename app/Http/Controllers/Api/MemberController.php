<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Member;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class MemberController extends Controller
{
    public function index(Request $request)
    {
        // TenantScope automatically filters by auth user's tenant
        $members = Member::latest()->get();
        return response()->json($members);
    }

    public function store(Request $request)
    {
        $tenantId = $request->user()->tenant_id;

        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'nomor_hp' => [
                'nullable',
                'string',
                'max:20',
                Rule::unique('members')->where(function ($query) use ($tenantId) {
                    return $query->where('tenant_id', $tenantId);
                })
            ],
            'poin' => 'nullable|integer|min:0',
            'alamat' => 'nullable|string'
        ]);

        $validated['tenant_id'] = $tenantId;
        
        $member = Member::create($validated);
        
        return response()->json($member, 201);
    }

    public function update(Request $request, Member $member)
    {
        $tenantId = $request->user()->tenant_id;

        if ($member->tenant_id !== $tenantId) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'nama' => 'sometimes|required|string|max:255',
            'nomor_hp' => [
                'nullable',
                'string',
                'max:20',
                Rule::unique('members')->where(function ($query) use ($tenantId) {
                    return $query->where('tenant_id', $tenantId);
                })->ignore($member->id)
            ],
            'poin' => 'nullable|integer|min:0',
            'alamat' => 'nullable|string'
        ]);

        $member->update($validated);
        
        return response()->json($member);
    }

    public function destroy(Request $request, Member $member)
    {
        if ($member->tenant_id !== $request->user()->tenant_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $member->delete();
        
        return response()->json(['message' => 'Member deleted successfully']);
    }
}
