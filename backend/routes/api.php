<?php

use App\Http\Controllers\Api\AuditLogController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DiscountController;
use App\Http\Controllers\Api\InventoryController;
use App\Http\Controllers\Api\InventoryAdjustmentController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\PurchaseOrderController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\RestaurantTableController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->middleware('throttle:api')->group(function () {
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::post('/cart/quote', [CartController::class, 'quote']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);

        Route::get('/dashboard', [DashboardController::class, 'index'])->can('cashier-access');
        Route::get('/reports/sales', [ReportController::class, 'sales'])->can('view-reports');
        Route::get('/reports/inventory', [ReportController::class, 'inventory'])->can('view-reports');

        Route::apiResource('categories', CategoryController::class);
        Route::post('/products/upload-image', [ProductController::class, 'uploadImage'])->can('manager-access');
        Route::apiResource('products', ProductController::class);
        Route::apiResource('inventory', InventoryController::class);
        Route::apiResource('inventory-adjustments', InventoryAdjustmentController::class)->only(['index', 'store']);
        Route::apiResource('suppliers', SupplierController::class);
        Route::apiResource('purchase-orders', PurchaseOrderController::class);
        Route::apiResource('customers', CustomerController::class);
        Route::apiResource('tables', RestaurantTableController::class);
        Route::apiResource('orders', OrderController::class);
        Route::apiResource('payments', PaymentController::class)->only(['index', 'show', 'store']);
        Route::apiResource('discounts', DiscountController::class);
        Route::get('/roles', [RoleController::class, 'index']);
        Route::apiResource('users', UserController::class);
        Route::apiResource('audit-logs', AuditLogController::class)->only(['index', 'show']);
        Route::apiResource('settings', SettingController::class)->only(['index', 'store', 'update']);

        Route::post('/orders/{order}/checkout', [CheckoutController::class, 'store'])->can('manage-orders');
        Route::post('/orders/{order}/capture-payment', [OrderController::class, 'capturePayment'])->can('manage-orders');
        Route::post('/orders/{order}/cancel', [OrderController::class, 'cancel'])->can('manage-orders');
        Route::post('/orders/{order}/void', [OrderController::class, 'void'])->can('manager-access');
        Route::get('/orders/{order}/receipt', [OrderController::class, 'receipt'])->can('view-order', 'order');
    });
});
