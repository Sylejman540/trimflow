<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // appointments: composite indexes for the most common query patterns
        Schema::table('appointments', function (Blueprint $table) {
            $table->index(['company_id', 'status', 'starts_at'], 'appts_company_status_starts');
            $table->index(['company_id', 'status', 'ends_at'],   'appts_company_status_ends');
            $table->index('status', 'appts_status');
        });

        // notifications: index on read_at for unread-count queries
        Schema::table('notifications', function (Blueprint $table) {
            $table->index('read_at', 'notifs_read_at');
        });
    }

    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropIndex('appts_company_status_starts');
            $table->dropIndex('appts_company_status_ends');
            $table->dropIndex('appts_status');
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->dropIndex('notifs_read_at');
        });
    }
};
