<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('company_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('provider');
            $table->text('prompt');
            $table->text('response')->nullable();
            $table->unsignedInteger('tokens_used')->nullable();
            $table->unsignedInteger('latency')->nullable(); // milliseconds
            $table->timestamps();

            $table->index(['company_id', 'provider']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_logs');
    }
};
