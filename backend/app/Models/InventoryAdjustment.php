<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InventoryAdjustment extends Model
{
    use HasFactory;
    use HasUlids;

    protected $fillable = [
        'inventory_id',
        'product_id',
        'order_id',
        'user_id',
        'type',
        'reason_type',
        'qty',
        'reason',
        'reference',
        'counted_qty',
        'before_qty',
        'after_qty',
        'adjusted_at',
    ];

    protected function casts(): array
    {
        return [
            'qty' => 'decimal:3',
            'counted_qty' => 'decimal:3',
            'before_qty' => 'decimal:3',
            'after_qty' => 'decimal:3',
            'adjusted_at' => 'datetime',
        ];
    }

    public function inventory(): BelongsTo
    {
        return $this->belongsTo(Inventory::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
