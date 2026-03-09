<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Convert any existing 'scheduled' appointments to 'confirmed'
        DB::table('appointments')->where('status', 'scheduled')->update(['status' => 'confirmed']);

        // Alter the enum column to remove 'scheduled' and change default
        DB::statement("ALTER TABLE appointments MODIFY COLUMN status ENUM('confirmed','in_progress','completed','cancelled','no_show') NOT NULL DEFAULT 'confirmed'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE appointments MODIFY COLUMN status ENUM('scheduled','confirmed','in_progress','completed','cancelled','no_show') NOT NULL DEFAULT 'scheduled'");
    }
};
