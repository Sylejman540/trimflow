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
        Schema::create('ig_conversations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('sender_id');          // Instagram sender PSID
            $table->json('messages');             // [{role, content}] full thread history
            $table->string('state')->default('idle');
            // states: idle | collecting_service | collecting_barber | collecting_date
            //         | collecting_time | collecting_name | collecting_phone | confirming | done
            $table->json('context')->nullable();  // partial booking data collected so far
            $table->timestamp('last_message_at')->nullable();
            $table->timestamps();

            $table->unique(['company_id', 'sender_id']);
            $table->index('last_message_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ig_conversations');
    }
};
