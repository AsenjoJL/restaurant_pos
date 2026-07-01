<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('client_reference', 100)->nullable()->after('order_number');
            $table->timestamp('inventory_deducted_at')->nullable()->after('paid_at');
            $table->timestamp('inventory_restored_at')->nullable()->after('inventory_deducted_at');

            $table->unique('client_reference');
            $table->index('inventory_deducted_at');
            $table->index('inventory_restored_at');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropUnique(['client_reference']);
            $table->dropIndex(['inventory_deducted_at']);
            $table->dropIndex(['inventory_restored_at']);
            $table->dropColumn([
                'client_reference',
                'inventory_deducted_at',
                'inventory_restored_at',
            ]);
        });
    }
};
