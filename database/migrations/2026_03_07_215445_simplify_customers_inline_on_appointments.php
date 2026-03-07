<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->string('customer_name')->after('service_id');
            $table->string('customer_phone')->nullable()->after('customer_name');
        });

        DB::table('appointments')
            ->join('customers', 'appointments.customer_id', '=', 'customers.id')
            ->update([
                'appointments.customer_name' => DB::raw('customers.name'),
                'appointments.customer_phone' => DB::raw('customers.phone'),
            ]);

        Schema::table('appointments', function (Blueprint $table) {
            $table->dropForeign(['customer_id']);
            $table->dropIndex(['customer_id', 'starts_at']);
            $table->dropColumn('customer_id');
        });

        Schema::table('reviews', function (Blueprint $table) {
            $table->dropForeign(['customer_id']);
            $table->dropColumn('customer_id');
        });

        Schema::table('barber_notes', function (Blueprint $table) {
            $table->dropForeign(['customer_id']);
            $table->dropColumn('customer_id');
        });

        Schema::dropIfExists('customers');
    }

    public function down(): void
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('favorite_barber_id')->nullable()->constrained('barbers')->nullOnDelete();
            $table->timestamps();
            $table->index(['company_id', 'email']);
            $table->index(['company_id', 'phone']);
        });

        Schema::table('barber_notes', function (Blueprint $table) {
            $table->foreignId('customer_id')->nullable()->constrained()->cascadeOnDelete();
        });

        Schema::table('reviews', function (Blueprint $table) {
            $table->foreignId('customer_id')->nullable()->constrained()->cascadeOnDelete();
        });

        Schema::table('appointments', function (Blueprint $table) {
            $table->foreignId('customer_id')->nullable()->constrained()->cascadeOnDelete();
            $table->dropColumn(['customer_name', 'customer_phone']);
        });
    }
};
