<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('purchase_orders', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('supplier_id')->constrained();
            $table->foreignUlid('created_by')->constrained('users');
            $table->string('po_number', 50)->unique();
            $table->string('status', 30)->default('DRAFT')->index();
            $table->date('ordered_at')->nullable()->index();
            $table->date('expected_at')->nullable()->index();
            $table->date('received_at')->nullable()->index();
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('tax_amount', 12, 2)->default(0);
            $table->decimal('total_amount', 12, 2)->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('purchase_order_items', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('purchase_order_id')->constrained()->cascadeOnDelete();
            $table->foreignUlid('product_id')->constrained();
            $table->decimal('quantity', 12, 3);
            $table->decimal('unit_cost', 12, 2);
            $table->decimal('line_total', 12, 2);
            $table->timestamps();

            $table->unique(['purchase_order_id', 'product_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchase_order_items');
        Schema::dropIfExists('purchase_orders');
    }
};
