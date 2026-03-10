<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('booking_fingerprints', function (Blueprint $table) {
            $table->id();
            $table->string('phone')->index();
            $table->string('ip_address', 45)->index();
            $table->string('user_agent', 512)->nullable();
            $table->unsignedInteger('booking_count')->default(1);
            $table->timestamp('last_booking_at')->nullable();
            $table->boolean('is_blocked')->default(false);
            $table->timestamps();

            $table->index(['phone', 'ip_address']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('booking_fingerprints');
    }
};
