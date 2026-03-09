<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->unsignedInteger('loyalty_points')->default(0)->after('notes');
            $table->timestamp('last_visit_at')->nullable()->after('loyalty_points');
        });
    }

    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropColumn(['loyalty_points', 'last_visit_at']);
        });
    }
};
