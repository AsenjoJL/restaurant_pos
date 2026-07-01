<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true)->index();
            $table->softDeletes();
            $table->timestamps();
        });

        Schema::create('suppliers', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('name');
            $table->string('contact_person')->nullable();
            $table->string('email')->nullable();
            $table->string('phone', 50)->nullable();
            $table->text('address')->nullable();
            $table->boolean('is_active')->default(true)->index();
            $table->softDeletes();
            $table->timestamps();
        });

        Schema::create('customers', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('name');
            $table->string('email')->nullable()->index();
            $table->string('phone', 50)->nullable()->index();
            $table->text('address')->nullable();
            $table->date('birth_date')->nullable();
            $table->boolean('is_active')->default(true)->index();
            $table->softDeletes();
            $table->timestamps();
        });

        Schema::create('restaurant_tables', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('name', 50)->unique();
            $table->unsignedSmallInteger('capacity')->default(2);
            $table->string('location')->nullable();
            $table->string('status', 30)->default('AVAILABLE')->index();
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
        });

        Schema::create('discounts', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('name');
            $table->string('code', 50)->unique();
            $table->string('type', 20);
            $table->decimal('value', 10, 2);
            $table->decimal('minimum_order_amount', 10, 2)->default(0);
            $table->boolean('is_active')->default(true)->index();
            $table->timestamp('starts_at')->nullable()->index();
            $table->timestamp('ends_at')->nullable()->index();
            $table->softDeletes();
            $table->timestamps();
        });

        Schema::create('settings', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('group', 100)->index();
            $table->string('key', 100);
            $table->json('value');
            $table->timestamps();

            $table->unique(['group', 'key']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
        Schema::dropIfExists('discounts');
        Schema::dropIfExists('restaurant_tables');
        Schema::dropIfExists('customers');
        Schema::dropIfExists('suppliers');
        Schema::dropIfExists('categories');
    }
};
