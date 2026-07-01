<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('category_id')->constrained();
            $table->foreignUlid('default_supplier_id')->nullable()->constrained('suppliers')->nullOnDelete();
            $table->string('sku', 50)->unique();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('product_class', 20)->index();
            $table->decimal('price', 12, 2)->default(0);
            $table->decimal('base_cost', 12, 2)->default(0);
            $table->string('image_url')->nullable();
            $table->boolean('track_inventory')->default(true)->index();
            $table->boolean('is_active')->default(true)->index();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['category_id', 'is_active']);
        });

        Schema::create('inventory', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('product_id')->constrained()->cascadeOnDelete();
            $table->foreignUlid('supplier_id')->nullable()->constrained('suppliers')->nullOnDelete();
            $table->decimal('quantity_on_hand', 12, 3)->default(0);
            $table->decimal('reorder_level', 12, 3)->default(0);
            $table->decimal('unit_cost', 12, 2)->default(0);
            $table->string('unit', 20)->default('pcs');
            $table->timestamp('last_restocked_at')->nullable();
            $table->timestamps();

            $table->unique('product_id');
            $table->index(['supplier_id', 'quantity_on_hand']);
        });

        Schema::create('recipe_items', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('product_id')->constrained()->cascadeOnDelete();
            $table->foreignUlid('ingredient_product_id')->constrained('products')->cascadeOnDelete();
            $table->decimal('quantity_required', 12, 3);
            $table->string('unit', 20)->default('pcs');
            $table->timestamps();

            $table->unique(['product_id', 'ingredient_product_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recipe_items');
        Schema::dropIfExists('inventory');
        Schema::dropIfExists('products');
    }
};
