<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->timestamp('kitchen_sent_at')->nullable()->after('paid_at')->index();
            $table->timestamp('kitchen_started_at')->nullable()->after('kitchen_sent_at')->index();
            $table->timestamp('kitchen_ready_at')->nullable()->after('kitchen_started_at')->index();
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['kitchen_sent_at', 'kitchen_started_at', 'kitchen_ready_at']);
        });
    }
};
