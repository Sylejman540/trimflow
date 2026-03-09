<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->enum('recurrence_rule', ['none', 'weekly', 'biweekly', 'monthly'])
                  ->default('none')
                  ->after('notes');
            $table->foreignId('recurrence_parent_id')
                  ->nullable()
                  ->constrained('appointments')
                  ->nullOnDelete()
                  ->after('recurrence_rule');
        });
    }

    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropForeign(['recurrence_parent_id']);
            $table->dropColumn(['recurrence_rule', 'recurrence_parent_id']);
        });
    }
};
