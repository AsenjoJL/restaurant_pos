<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use HasFactory;
    use HasUlids;
    use SoftDeletes;

    protected $fillable = [
        'order_number',
        'client_reference',
        'customer_id',
        'restaurant_table_id',
        'discount_id',
        'processed_by',
        'modified_by',
        'source',
        'status',
        'order_type',
        'note',
        'subtotal',
        'discount_amount',
        'service_charge_amount',
        'tax_amount',
        'total_amount',
        'placed_at',
        'paid_at',
        'inventory_deducted_at',
        'inventory_restored_at',
        'kitchen_sent_at',
        'kitchen_started_at',
        'kitchen_ready_at',
        'completed_at',
        'cancelled_at',
    ];

    protected function casts(): array
    {
        return [
            'subtotal' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'service_charge_amount' => 'decimal:2',
            'tax_amount' => 'decimal:2',
            'total_amount' => 'decimal:2',
            'placed_at' => 'datetime',
            'paid_at' => 'datetime',
            'inventory_deducted_at' => 'datetime',
            'inventory_restored_at' => 'datetime',
            'kitchen_sent_at' => 'datetime',
            'kitchen_started_at' => 'datetime',
            'kitchen_ready_at' => 'datetime',
            'completed_at' => 'datetime',
            'cancelled_at' => 'datetime',
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function table(): BelongsTo
    {
        return $this->belongsTo(RestaurantTable::class, 'restaurant_table_id');
    }

    public function discount(): BelongsTo
    {
        return $this->belongsTo(Discount::class);
    }

    public function processedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    public function modifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'modified_by');
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function inventoryAdjustments(): HasMany
    {
        return $this->hasMany(InventoryAdjustment::class);
    }
}
