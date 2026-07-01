<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Inventory;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\RecipeItem;
use App\Models\Role;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class BackendHardeningTest extends TestCase
{
    use RefreshDatabase;

    public function test_received_purchase_order_notes_update_does_not_apply_inventory_twice(): void
    {
        $admin = $this->createUserWithRole('admin');
        Sanctum::actingAs($admin);

        $supplier = Supplier::create([
            'name' => 'Main Supplier',
            'contact_person' => 'Supplier Rep',
            'email' => 'supplier@example.com',
            'phone' => '09170000000',
            'address' => 'Manila',
            'is_active' => true,
        ]);

        $category = Category::create([
            'name' => 'Beverages',
            'slug' => 'beverages',
            'description' => 'Beverages',
            'is_active' => true,
        ]);

        $product = Product::create([
            'category_id' => $category->id,
            'default_supplier_id' => $supplier->id,
            'sku' => 'SKU-100',
            'name' => 'Cola',
            'slug' => 'cola',
            'description' => 'Cola',
            'product_class' => 'FINISHED_GOOD',
            'price' => 50,
            'base_cost' => 20,
            'track_inventory' => true,
            'is_active' => true,
        ]);

        $storeResponse = $this->postJson('/api/v1/purchase-orders', [
            'supplier_id' => $supplier->id,
            'status' => 'RECEIVED',
            'received_at' => now()->toDateString(),
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 5,
                    'unit_cost' => 20,
                ],
            ],
        ]);

        $storeResponse->assertCreated();

        $purchaseOrderId = $storeResponse->json('data.id');

        $this->assertSame('5.000', Inventory::query()->firstOrFail()->quantity_on_hand);

        $updateResponse = $this->patchJson("/api/v1/purchase-orders/{$purchaseOrderId}", [
            'notes' => 'Updated note only.',
        ]);

        $updateResponse->assertOk();

        $inventory = Inventory::query()->firstOrFail();
        $purchaseOrder = PurchaseOrder::query()->findOrFail($purchaseOrderId);

        $this->assertSame('5.000', $inventory->quantity_on_hand);
        $this->assertNotNull($purchaseOrder->received_inventory_applied_at);
    }

    public function test_paid_orders_cannot_be_cancelled(): void
    {
        $cashier = $this->createUserWithRole('cashier');
        Sanctum::actingAs($cashier);

        $order = Order::create([
            'order_number' => 'ORD-TEST-1000',
            'source' => 'STAFF',
            'status' => 'PAID',
            'order_type' => 'DINE_IN',
            'subtotal' => 100,
            'discount_amount' => 0,
            'service_charge_amount' => 0,
            'tax_amount' => 12,
            'total_amount' => 112,
            'processed_by' => $cashier->id,
            'modified_by' => $cashier->id,
            'placed_at' => now(),
            'paid_at' => now(),
        ]);

        Payment::create([
            'order_id' => $order->id,
            'received_by' => $cashier->id,
            'method' => 'CASH',
            'amount' => 112,
            'change_amount' => 0,
            'status' => 'CAPTURED',
            'paid_at' => now(),
        ]);

        $response = $this->postJson("/api/v1/orders/{$order->id}/cancel", [
            'reason' => 'Should not be allowed.',
        ]);

        $response
            ->assertStatus(422)
            ->assertJsonPath(
                'message',
                'Cancelled paid or completed orders is not supported until refund and inventory reversal flows are implemented.'
            );
    }

    public function test_tracked_inventory_requires_an_inventory_record_to_checkout(): void
    {
        $cashier = $this->createUserWithRole('cashier');
        Sanctum::actingAs($cashier);

        $supplier = Supplier::create([
            'name' => 'Tracked Supplier',
            'contact_person' => 'Supplier Rep',
            'email' => 'tracked@example.com',
            'phone' => '09170000001',
            'address' => 'Manila',
            'is_active' => true,
        ]);

        $category = Category::create([
            'name' => 'Meals',
            'slug' => 'meals',
            'description' => 'Meals',
            'is_active' => true,
        ]);

        $product = Product::create([
            'category_id' => $category->id,
            'default_supplier_id' => $supplier->id,
            'sku' => 'SKU-200',
            'name' => 'Burger',
            'slug' => 'burger',
            'description' => 'Burger',
            'product_class' => 'FINISHED_GOOD',
            'price' => 99,
            'base_cost' => 50,
            'track_inventory' => true,
            'is_active' => true,
        ]);

        $order = Order::create([
            'order_number' => 'ORD-TRACKED-1000',
            'source' => 'STAFF',
            'status' => 'PENDING_PAYMENT',
            'order_type' => 'DINE_IN',
            'subtotal' => 99,
            'discount_amount' => 0,
            'service_charge_amount' => 0,
            'tax_amount' => 11.88,
            'total_amount' => 110.88,
            'processed_by' => $cashier->id,
            'modified_by' => $cashier->id,
            'placed_at' => now(),
        ]);

        $order->items()->create([
            'product_id' => $product->id,
            'name' => 'Burger',
            'unit_price' => 99,
            'quantity' => 1,
            'line_subtotal' => 99,
        ]);

        $response = $this->postJson("/api/v1/orders/{$order->id}/capture-payment", [
            'method' => 'CASH',
            'amount' => 110.88,
        ]);

        $response
            ->assertStatus(422)
            ->assertJsonPath('errors.inventory.0', 'Inventory shortage: Tracked inventory record is missing for Burger.');
    }

    public function test_capture_payment_deducts_recipe_ingredient_inventory(): void
    {
        $cashier = $this->createUserWithRole('cashier');
        Sanctum::actingAs($cashier);

        $supplier = Supplier::create([
            'name' => 'Recipe Supplier',
            'contact_person' => 'Supplier Rep',
            'email' => 'recipe@example.com',
            'phone' => '09170000002',
            'address' => 'Manila',
            'is_active' => true,
        ]);

        $category = Category::create([
            'name' => 'Bakery',
            'slug' => 'bakery',
            'description' => 'Bakery',
            'is_active' => true,
        ]);

        $ingredient = Product::create([
            'category_id' => $category->id,
            'default_supplier_id' => $supplier->id,
            'sku' => 'ING-DOUGH',
            'name' => 'Pizza Dough',
            'slug' => 'pizza-dough',
            'description' => 'Dough',
            'product_class' => 'RAW',
            'price' => 0,
            'base_cost' => 1,
            'track_inventory' => true,
            'is_active' => true,
        ]);

        $menuItem = Product::create([
            'category_id' => $category->id,
            'default_supplier_id' => $supplier->id,
            'sku' => 'PRD-PIZZA',
            'name' => 'Pizza',
            'slug' => 'pizza',
            'description' => 'Pizza',
            'product_class' => 'NON_RAW',
            'price' => 450,
            'base_cost' => 120,
            'track_inventory' => true,
            'is_active' => true,
        ]);

        Inventory::create([
            'product_id' => $ingredient->id,
            'supplier_id' => $supplier->id,
            'quantity_on_hand' => 100,
            'reorder_level' => 10,
            'unit_cost' => 1,
            'unit' => 'g',
        ]);

        RecipeItem::create([
            'product_id' => $menuItem->id,
            'ingredient_product_id' => $ingredient->id,
            'quantity_required' => 25,
            'unit' => 'g',
        ]);

        $order = Order::create([
            'order_number' => 'ORD-RECIPE-1000',
            'source' => 'STAFF',
            'status' => 'PENDING_PAYMENT',
            'order_type' => 'DINE_IN',
            'subtotal' => 450,
            'discount_amount' => 0,
            'service_charge_amount' => 0,
            'tax_amount' => 54,
            'total_amount' => 504,
            'processed_by' => $cashier->id,
            'modified_by' => $cashier->id,
            'placed_at' => now(),
        ]);

        $order->items()->create([
            'product_id' => $menuItem->id,
            'name' => 'Pizza',
            'unit_price' => 450,
            'quantity' => 2,
            'line_subtotal' => 900,
        ]);

        $response = $this->postJson("/api/v1/orders/{$order->id}/capture-payment", [
            'method' => 'CASH',
            'amount' => 504,
        ]);

        $response->assertOk();

        $ingredientInventory = Inventory::query()->where('product_id', $ingredient->id)->firstOrFail();

        $this->assertSame('50.000', $ingredientInventory->quantity_on_hand);
        $this->assertSame('PAID', $order->fresh()->status);
        $this->assertNotNull($order->fresh()->paid_at);
    }

    public function test_capture_payment_can_send_order_to_kitchen_atomically(): void
    {
        $cashier = $this->createUserWithRole('cashier');
        Sanctum::actingAs($cashier);

        $supplier = Supplier::create([
            'name' => 'Kitchen Supplier',
            'contact_person' => 'Supplier Rep',
            'email' => 'kitchen@example.com',
            'phone' => '09170000003',
            'address' => 'Manila',
            'is_active' => true,
        ]);

        $category = Category::create([
            'name' => 'Meals',
            'slug' => 'meals',
            'description' => 'Meals',
            'is_active' => true,
        ]);

        $ingredient = Product::create([
            'category_id' => $category->id,
            'default_supplier_id' => $supplier->id,
            'sku' => 'ING-SAUCE',
            'name' => 'Sauce',
            'slug' => 'sauce',
            'description' => 'Sauce',
            'product_class' => 'RAW',
            'price' => 0,
            'base_cost' => 1,
            'track_inventory' => true,
            'is_active' => true,
        ]);

        $menuItem = Product::create([
            'category_id' => $category->id,
            'default_supplier_id' => $supplier->id,
            'sku' => 'PRD-MEAL',
            'name' => 'Meal',
            'slug' => 'meal',
            'description' => 'Meal',
            'product_class' => 'NON_RAW',
            'price' => 200,
            'base_cost' => 50,
            'track_inventory' => true,
            'is_active' => true,
        ]);

        Inventory::create([
            'product_id' => $ingredient->id,
            'supplier_id' => $supplier->id,
            'quantity_on_hand' => 20,
            'reorder_level' => 2,
            'unit_cost' => 1,
            'unit' => 'g',
        ]);

        RecipeItem::create([
            'product_id' => $menuItem->id,
            'ingredient_product_id' => $ingredient->id,
            'quantity_required' => 5,
            'unit' => 'g',
        ]);

        $order = Order::create([
            'order_number' => 'ORD-KITCHEN-2000',
            'source' => 'STAFF',
            'status' => 'PENDING_PAYMENT',
            'order_type' => 'DINE_IN',
            'subtotal' => 200,
            'discount_amount' => 0,
            'service_charge_amount' => 0,
            'tax_amount' => 24,
            'total_amount' => 224,
            'processed_by' => $cashier->id,
            'modified_by' => $cashier->id,
            'placed_at' => now(),
        ]);

        $order->items()->create([
            'product_id' => $menuItem->id,
            'name' => 'Meal',
            'unit_price' => 200,
            'quantity' => 1,
            'line_subtotal' => 200,
        ]);

        $response = $this->postJson("/api/v1/orders/{$order->id}/capture-payment", [
            'method' => 'CASH',
            'amount' => 224,
            'next_status' => 'SENT_TO_KITCHEN',
        ]);

        $response->assertOk();

        $order->refresh();

        $this->assertSame('SENT_TO_KITCHEN', $order->status);
        $this->assertNotNull($order->paid_at);
        $this->assertNotNull($order->kitchen_sent_at);
        $this->assertSame('15.000', Inventory::query()->where('product_id', $ingredient->id)->firstOrFail()->quantity_on_hand);
    }

    public function test_store_order_deducts_inventory_once_and_capture_payment_does_not_double_deduct(): void
    {
        $cashier = $this->createUserWithRole('cashier');
        Sanctum::actingAs($cashier);

        [$ingredient, $menuItem] = $this->createRecipeBackedMenuItem(100, 25);

        $response = $this->postJson('/api/v1/orders', [
            'client_reference' => 'client-order-001',
            'source' => 'STAFF',
            'order_type' => 'DINE_IN',
            'items' => [
                [
                    'product_id' => $menuItem->id,
                    'name' => 'Pizza',
                    'price' => 450,
                    'quantity' => 2,
                ],
            ],
        ]);

        $response->assertCreated();

        $orderId = $response->json('data.id');
        $inventoryAfterStore = Inventory::query()->where('product_id', $ingredient->id)->firstOrFail();
        $this->assertSame('50.000', $inventoryAfterStore->quantity_on_hand);
        $this->assertNotNull(Order::query()->findOrFail($orderId)->inventory_deducted_at);

        $paymentResponse = $this->postJson("/api/v1/orders/{$orderId}/capture-payment", [
            'method' => 'CASH',
            'amount' => 1008,
        ]);

        $paymentResponse->assertOk();

        $inventoryAfterPayment = Inventory::query()->where('product_id', $ingredient->id)->firstOrFail();
        $this->assertSame('50.000', $inventoryAfterPayment->quantity_on_hand);
    }

    public function test_store_order_rejects_inventory_shortage_and_rolls_back(): void
    {
        $cashier = $this->createUserWithRole('cashier');
        Sanctum::actingAs($cashier);

        [$ingredient, $menuItem] = $this->createRecipeBackedMenuItem(20, 25);

        $response = $this->postJson('/api/v1/orders', [
            'client_reference' => 'client-order-002',
            'source' => 'STAFF',
            'order_type' => 'DINE_IN',
            'items' => [
                [
                    'product_id' => $menuItem->id,
                    'name' => 'Pizza',
                    'price' => 450,
                    'quantity' => 1,
                ],
            ],
        ]);

        $response
            ->assertStatus(422)
            ->assertJsonPath('errors.inventory.0', 'Inventory shortage: Pizza Dough needs 25 g, on hand 20 g.');

        $this->assertDatabaseCount('orders', 0);
        $this->assertSame('20.000', Inventory::query()->where('product_id', $ingredient->id)->firstOrFail()->quantity_on_hand);
    }

    public function test_store_order_is_idempotent_for_duplicate_client_reference(): void
    {
        $cashier = $this->createUserWithRole('cashier');
        Sanctum::actingAs($cashier);

        [$ingredient, $menuItem] = $this->createRecipeBackedMenuItem(100, 25);

        $payload = [
            'client_reference' => 'client-order-003',
            'source' => 'STAFF',
            'order_type' => 'DINE_IN',
            'items' => [
                [
                    'product_id' => $menuItem->id,
                    'name' => 'Pizza',
                    'price' => 450,
                    'quantity' => 1,
                ],
            ],
        ];

        $first = $this->postJson('/api/v1/orders', $payload);
        $second = $this->postJson('/api/v1/orders', $payload);

        $first->assertCreated();
        $second->assertCreated();
        $this->assertSame($first->json('data.id'), $second->json('data.id'));
        $this->assertDatabaseCount('orders', 1);
        $this->assertSame('75.000', Inventory::query()->where('product_id', $ingredient->id)->firstOrFail()->quantity_on_hand);
    }

    public function test_updating_pending_order_restores_old_inventory_and_deducts_new_recipe_quantities(): void
    {
        $cashier = $this->createUserWithRole('cashier');
        Sanctum::actingAs($cashier);

        [$ingredient, $menuItem] = $this->createRecipeBackedMenuItem(100, 25);

        $createResponse = $this->postJson('/api/v1/orders', [
            'client_reference' => 'client-order-004',
            'source' => 'STAFF',
            'order_type' => 'DINE_IN',
            'items' => [
                [
                    'product_id' => $menuItem->id,
                    'name' => 'Pizza',
                    'price' => 450,
                    'quantity' => 1,
                ],
            ],
        ]);

        $createResponse->assertCreated();
        $orderId = $createResponse->json('data.id');

        $updateResponse = $this->putJson("/api/v1/orders/{$orderId}", [
            'items' => [
                [
                    'product_id' => $menuItem->id,
                    'name' => 'Pizza',
                    'price' => 450,
                    'quantity' => 3,
                ],
            ],
        ]);

        $updateResponse->assertOk();

        $this->assertSame('25.000', Inventory::query()->where('product_id', $ingredient->id)->firstOrFail()->quantity_on_hand);
    }

    public function test_cancelling_unpaid_order_restores_inventory(): void
    {
        $cashier = $this->createUserWithRole('cashier');
        Sanctum::actingAs($cashier);

        [$ingredient, $menuItem] = $this->createRecipeBackedMenuItem(100, 25);

        $createResponse = $this->postJson('/api/v1/orders', [
            'client_reference' => 'client-order-005',
            'source' => 'STAFF',
            'order_type' => 'DINE_IN',
            'items' => [
                [
                    'product_id' => $menuItem->id,
                    'name' => 'Pizza',
                    'price' => 450,
                    'quantity' => 2,
                ],
            ],
        ]);

        $createResponse->assertCreated();
        $orderId = $createResponse->json('data.id');

        $cancelResponse = $this->postJson("/api/v1/orders/{$orderId}/cancel", [
            'reason' => 'Customer changed mind',
        ]);

        $cancelResponse->assertOk();
        $this->assertSame('100.000', Inventory::query()->where('product_id', $ingredient->id)->firstOrFail()->quantity_on_hand);
        $this->assertNotNull(Order::query()->findOrFail($orderId)->inventory_restored_at);
    }

    public function test_order_update_cannot_set_paid_directly(): void
    {
        $cashier = $this->createUserWithRole('cashier');
        Sanctum::actingAs($cashier);

        $order = Order::create([
            'order_number' => 'ORD-STATUS-1000',
            'source' => 'STAFF',
            'status' => 'PENDING_PAYMENT',
            'order_type' => 'DINE_IN',
            'subtotal' => 100,
            'discount_amount' => 0,
            'service_charge_amount' => 0,
            'tax_amount' => 12,
            'total_amount' => 112,
            'processed_by' => $cashier->id,
            'modified_by' => $cashier->id,
            'placed_at' => now(),
        ]);

        $response = $this->putJson("/api/v1/orders/{$order->id}", [
            'status' => 'PAID',
        ]);

        $response->assertStatus(422);
    }

    public function test_kitchen_status_updates_persist_kitchen_timestamps(): void
    {
        $kitchen = $this->createUserWithRole('kitchen');
        Sanctum::actingAs($kitchen);

        $order = Order::create([
            'order_number' => 'ORD-KITCHEN-1000',
            'source' => 'STAFF',
            'status' => 'SENT_TO_KITCHEN',
            'order_type' => 'DINE_IN',
            'subtotal' => 100,
            'discount_amount' => 0,
            'service_charge_amount' => 0,
            'tax_amount' => 12,
            'total_amount' => 112,
            'processed_by' => $kitchen->id,
            'modified_by' => $kitchen->id,
            'placed_at' => now(),
            'paid_at' => now(),
        ]);

        $startResponse = $this->putJson("/api/v1/orders/{$order->id}", [
            'status' => 'PREPARING',
        ]);

        $startResponse->assertOk();
        $this->assertNotNull($order->fresh()->kitchen_sent_at);
        $this->assertNotNull($order->fresh()->kitchen_started_at);

        $readyResponse = $this->putJson("/api/v1/orders/{$order->id}", [
            'status' => 'READY_FOR_PICKUP',
        ]);

        $readyResponse->assertOk();
        $this->assertNotNull($order->fresh()->kitchen_ready_at);
    }

    public function test_product_index_falls_back_to_safe_sort_column_and_clamps_page_size(): void
    {
        $admin = $this->createUserWithRole('admin');
        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/v1/products?per_page=9999&sort=drop table users&direction=sideways');

        $response
            ->assertOk()
            ->assertJsonPath('meta.per_page', 250)
            ->assertJsonPath('meta.current_page', 1);
    }

    public function test_admin_can_create_cashier_and_kitchen_users(): void
    {
        $admin = $this->createUserWithRole('admin');
        $cashierRole = $this->createRole('cashier');
        $kitchenRole = $this->createRole('kitchen');

        Sanctum::actingAs($admin);

        $cashierResponse = $this->postJson('/api/v1/users', [
            'role_id' => $cashierRole->id,
            'name' => 'Cashier One',
            'username' => 'cashier.one',
            'password' => 'password123',
            'is_active' => true,
        ]);

        $cashierResponse
            ->assertSuccessful()
            ->assertJsonPath('data.role', 'cashier')
            ->assertJsonPath('data.username', 'cashier.one');

        $kitchenResponse = $this->postJson('/api/v1/users', [
            'role_id' => $kitchenRole->id,
            'name' => 'Kitchen One',
            'username' => 'kitchen.one',
            'password' => 'password123',
            'is_active' => true,
        ]);

        $kitchenResponse
            ->assertSuccessful()
            ->assertJsonPath('data.role', 'kitchen')
            ->assertJsonPath('data.username', 'kitchen.one');
    }

    public function test_admin_can_change_staff_password(): void
    {
        $admin = $this->createUserWithRole('admin');
        $cashier = $this->createUserWithRole('cashier');

        Sanctum::actingAs($admin);

        $response = $this->patchJson("/api/v1/users/{$cashier->id}", [
            'password' => 'updatedpass123',
        ]);

        $response->assertOk();
        $this->assertTrue(Hash::check('updatedpass123', $cashier->fresh()->password));
    }

    public function test_manager_cannot_manage_users(): void
    {
        $manager = $this->createUserWithRole('manager');
        $cashierRole = $this->createRole('cashier');

        Sanctum::actingAs($manager);

        $response = $this->postJson('/api/v1/users', [
            'role_id' => $cashierRole->id,
            'name' => 'Blocked Cashier',
            'username' => 'blocked.cashier',
            'password' => 'password123',
            'is_active' => true,
        ]);

        $response->assertForbidden();
    }

    private function createUserWithRole(string $roleSlug): User
    {
        $role = $this->createRole($roleSlug);

        return User::create([
            'role_id' => $role->id,
            'name' => ucfirst($roleSlug).' User',
            'username' => $roleSlug.'_user',
            'email' => $roleSlug.'@example.com',
            'password' => 'password123',
            'is_active' => true,
        ]);
    }

    private function createRole(string $roleSlug): Role
    {
        return Role::firstOrCreate(
            ['slug' => $roleSlug],
            ['name' => ucfirst($roleSlug)]
        );
    }

    private function createRecipeBackedMenuItem(float $stockQty, float $recipeQty): array
    {
        $supplier = Supplier::create([
            'name' => 'Shared Recipe Supplier',
            'contact_person' => 'Supplier Rep',
            'email' => 'shared.recipe@example.com',
            'phone' => '09179999999',
            'address' => 'Manila',
            'is_active' => true,
        ]);

        $category = Category::create([
            'name' => 'Bakery',
            'slug' => 'bakery-'.uniqid(),
            'description' => 'Bakery',
            'is_active' => true,
        ]);

        $ingredient = Product::create([
            'category_id' => $category->id,
            'default_supplier_id' => $supplier->id,
            'sku' => 'ING-'.uniqid(),
            'name' => 'Pizza Dough',
            'slug' => 'pizza-dough-'.uniqid(),
            'description' => 'Dough',
            'product_class' => 'RAW',
            'price' => 0,
            'base_cost' => 1,
            'track_inventory' => true,
            'is_active' => true,
        ]);

        $menuItem = Product::create([
            'category_id' => $category->id,
            'default_supplier_id' => $supplier->id,
            'sku' => 'PRD-'.uniqid(),
            'name' => 'Pizza',
            'slug' => 'pizza-'.uniqid(),
            'description' => 'Pizza',
            'product_class' => 'NON_RAW',
            'price' => 450,
            'base_cost' => 120,
            'track_inventory' => true,
            'is_active' => true,
        ]);

        Inventory::create([
            'product_id' => $ingredient->id,
            'supplier_id' => $supplier->id,
            'quantity_on_hand' => $stockQty,
            'reorder_level' => 10,
            'unit_cost' => 1,
            'unit' => 'g',
        ]);

        RecipeItem::create([
            'product_id' => $menuItem->id,
            'ingredient_product_id' => $ingredient->id,
            'quantity_required' => $recipeQty,
            'unit' => 'g',
        ]);

        return [$ingredient, $menuItem];
    }
}
