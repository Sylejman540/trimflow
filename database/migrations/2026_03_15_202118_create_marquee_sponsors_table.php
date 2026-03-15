<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('marquee_sponsors', function (Blueprint $table) {
            $table->id();
            $table->string('shop_name');
            $table->string('url')->nullable();          // optional click-through link
            $table->integer('amount_paid')->default(0); // cents
            $table->timestamp('active_until')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('marquee_sponsors');
    }
};
