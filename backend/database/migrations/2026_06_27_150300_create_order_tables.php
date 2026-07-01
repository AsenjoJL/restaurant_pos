<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('order_number', 50)->unique();
            $table->foreignUlid('customer_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUlid('restaurant_table_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUlid('discount_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUlid('processed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignUlid('modified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('source', 20)->default('STAFF')->index();
            $table->string('status', 30)->default('PENDING_PAYMENT')->index();
            $table->string('order_type', 20)->default('DINE_IN')->index();
            $table->text('note')->nullable();
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('discount_amount', 12, 2)->default(0);
            $table->decimal('service_charge_amount', 12, 2)->default(0);
            $table->decimal('tax_amount', 12, 2)->default(0);
            $table->decimal('total_amount', 12, 2)->default(0);
            $table->timestamp('placed_at')->nullable()->index();
            $table->timestamp('paid_at')->nullable()->index();
            $table->timestamp('completed_at')->nullable()->index();
            $table->timestamp('cancelled_at')->nullable()->index();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['status', 'placed_at']);
        });

        Schema::create('order_items', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('order_id')->constrained()->cascadeOnDelete();
            $table->foreignUlid('product_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->decimal('unit_price', 12, 2);
            $table->unsignedInteger('quantity');
            $table->decimal('line_subtotal', 12, 2);
            $table->json('modifiers')->nullable();
            $table->text('note')->nullable();
            $table->json('bundle_items')->nullable();
            $table->timestamps();
        });

        Schema::create('payments', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('order_id')->constrained()->cascadeOnDelete();
            $table->foreignUlid('received_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('method', 20)->index();
            $table->decimal('amount', 12, 2);
            $table->decimal('change_amount', 12, 2)->default(0);
            $table->string('reference', 100)->nullable()->index();
            $table->string('payer_name')->nullable();
            $table->string('status', 30)->default('CAPTURED')->index();
            $table->timestamp('paid_at')->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
    }
};
