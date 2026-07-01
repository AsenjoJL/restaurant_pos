<?php

namespace App\Services;

use App\Models\Inventory;
use App\Models\Order;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Carbon;

class ReportService
{
    public function sales(?string $period = 'daily', ?string $from = null, ?string $to = null): array
    {
        [$start, $end] = $this->resolveWindow($period, $from, $to);

        $query = Order::query()
            ->whereNotNull('paid_at')
            ->whereBetween('paid_at', [$start, $end]);

        return [
            'period' => $period,
            'from' => $start->toIso8601String(),
            'to' => $end->toIso8601String(),
            'summary' => [
                'gross_sales' => (float) $query->clone()->sum('subtotal'),
                'discounts' => (float) $query->clone()->sum('discount_amount'),
                'taxes' => (float) $query->clone()->sum('tax_amount'),
                'net_sales' => (float) $query->clone()->sum('total_amount'),
                'orders_count' => $query->clone()->count(),
            ],
            'top_items' => \App\Models\OrderItem::query()
                ->selectRaw('name, SUM(quantity) as quantity_sold, SUM(line_subtotal) as revenue')
                ->whereHas('order', fn (Builder $builder) => $builder->whereBetween('paid_at', [$start, $end]))
                ->groupBy('name')
                ->orderByDesc('quantity_sold')
                ->limit(10)
                ->get(),
        ];
    }

    public function inventory(): array
    {
        return [
            'low_stock' => Inventory::with('product.category')
                ->whereColumn('quantity_on_hand', '<=', 'reorder_level')
                ->orderBy('quantity_on_hand')
                ->get(),
            'inventory_value' => (float) Inventory::selectRaw('SUM(quantity_on_hand * unit_cost) as value')->value('value'),
        ];
    }

    private function resolveWindow(?string $period, ?string $from, ?string $to): array
    {
        return match ($period) {
            'weekly' => [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()],
            'monthly' => [Carbon::now()->startOfMonth(), Carbon::now()->endOfMonth()],
            'custom' => [Carbon::parse($from ?? Carbon::today()), Carbon::parse($to ?? Carbon::today())->endOfDay()],
            default => [Carbon::today(), Carbon::today()->endOfDay()],
        };
    }
}
