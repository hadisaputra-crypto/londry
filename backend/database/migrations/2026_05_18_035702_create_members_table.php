<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->string('nama');
            $table->string('nomor_hp')->nullable();
            $table->integer('poin')->default(0);
            $table->text('alamat')->nullable();
            $table->timestamps();

            $table->index('tenant_id');
            $table->index('nomor_hp');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('members');
    }
};
