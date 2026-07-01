<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\User;
use Illuminate\Support\Carbon;

class DashboardService
{
    public function stats(): array
    {
        $today = Carbon::today();

        return [
            'sales_today' => (float) Order::whereDate('paid_at', $today)->sum('total_amount'),
            'orders_today' => Order::whereDate('placed_at', $today)->count(),
            'pending_orders' => Order::whereIn('status', ['PENDING_PAYMENT', 'HOLD', 'SENT_TO_KITCHEN', 'PREPARING'])->count(),
            'active_products' => Product::where('is_active', true)->count(),
            'pending_purchase_orders' => PurchaseOrder::whereIn('status', ['DRAFT', 'SUBMITTED'])->count(),
            'active_users' => User::where('is_active', true)->count(),
        ];
    }
}
