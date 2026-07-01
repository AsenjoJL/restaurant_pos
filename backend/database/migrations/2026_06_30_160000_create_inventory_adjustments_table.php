<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory_adjustments', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('inventory_id')->constrained('inventory')->cascadeOnDelete();
            $table->foreignUlid('product_id')->constrained()->cascadeOnDelete();
            $table->foreignUlid('order_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUlid('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('type', 20);
            $table->string('reason_type', 20)->index();
            $table->decimal('qty', 12, 3);
            $table->text('reason')->nullable();
            $table->string('reference', 100)->nullable()->index();
            $table->decimal('counted_qty', 12, 3)->nullable();
            $table->decimal('before_qty', 12, 3);
            $table->decimal('after_qty', 12, 3);
            $table->timestamp('adjusted_at')->index();
            $table->timestamps();

            $table->index(['product_id', 'adjusted_at']);
            $table->index(['inventory_id', 'adjusted_at']);
            $table->index(['order_id', 'adjusted_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_adjustments');
    }
};
