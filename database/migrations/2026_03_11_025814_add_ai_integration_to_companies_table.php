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
        Schema::table('companies', function (Blueprint $table) {
            $table->text('meta_access_token')->nullable()->after('timezone');
            $table->string('meta_page_id')->nullable()->after('meta_access_token');
            $table->text('openai_api_key')->nullable()->after('meta_page_id');
            $table->boolean('instagram_agent_enabled')->default(false)->after('openai_api_key');
        });
    }

    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn(['meta_access_token', 'meta_page_id', 'openai_api_key', 'instagram_agent_enabled']);
        });
    }
};
