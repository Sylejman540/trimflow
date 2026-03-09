<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE appointments MODIFY COLUMN status ENUM('pending','confirmed','in_progress','completed','cancelled','no_show') NOT NULL DEFAULT 'confirmed'");
    }

    public function down(): void
    {
        DB::table('appointments')->where('status', 'pending')->update(['status' => 'confirmed']);
        DB::statement("ALTER TABLE appointments MODIFY COLUMN status ENUM('confirmed','in_progress','completed','cancelled','no_show') NOT NULL DEFAULT 'confirmed'");
    }
};
