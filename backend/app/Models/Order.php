<?php

namespace App\Models;

use App\Models\Scopes\TenantScope;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Auth;

class Order extends Model
{
    protected $fillable = [
        'tenant_id',
        'member_id',
        'nomor_nota',
        'berat_cucian',
        'total_harga',
        'status_cucian',
    ];

    protected static function booted(): void
    {
        // Auto-filter query berdasarkan tenant user yang login
        static::addGlobalScope(new TenantScope);

        // Auto-set tenant_id saat membuat order baru
        static::creating(function (Model $model) {
            if (Auth::check() && Auth::user()->tenant_id) {
                $model->tenant_id = Auth::user()->tenant_id;
            }
        });
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function orderDetails()
    {
        return $this->hasMany(OrderDetail::class);
    }
}
