<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->string('nama_layanan');
            $table->enum('jenis_layanan', ['kiloan', 'satuan']);
            $table->decimal('harga_per_unit', 12, 2);
            $table->string('satuan_unit', 20);
            $table->timestamps();

            $table->index('tenant_id');
            $table->index(['tenant_id', 'jenis_layanan']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('services');
    }
};
