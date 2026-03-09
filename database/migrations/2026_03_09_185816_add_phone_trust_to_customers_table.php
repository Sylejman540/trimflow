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
        Schema::table('customers', function (Blueprint $table) {
            $table->unsignedSmallInteger('booking_no_shows')->default(0)->after('loyalty_points');
            $table->unsignedSmallInteger('booking_total')->default(0)->after('booking_no_shows');
            // Status: 'ok' | 'restricted' | 'blocked'
            $table->string('booking_trust', 20)->default('ok')->after('booking_total');
        });
    }

    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropColumn(['booking_no_shows', 'booking_total', 'booking_trust']);
        });
    }
};
