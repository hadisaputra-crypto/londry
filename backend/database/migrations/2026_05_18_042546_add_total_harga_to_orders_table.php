<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Also make berat_cucian nullable since we might only use service qty now
            $table->decimal('berat_cucian', 8, 2)->nullable()->change();
            $table->decimal('total_harga', 12, 2)->default(0)->after('status_cucian');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('total_harga');
            $table->decimal('berat_cucian', 8, 2)->nullable(false)->change();
        });
    }
};
