<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Inventory extends Model
{
    use HasFactory;
    use HasUlids;

    protected $table = 'inventory';

    protected $fillable = [
        'product_id',
        'supplier_id',
        'quantity_on_hand',
        'reorder_level',
        'unit_cost',
        'unit',
        'last_restocked_at',
    ];

    protected function casts(): array
    {
        return [
            'quantity_on_hand' => 'decimal:3',
            'reorder_level' => 'decimal:3',
            'unit_cost' => 'decimal:2',
            'last_restocked_at' => 'datetime',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function adjustments(): HasMany
    {
        return $this->hasMany(InventoryAdjustment::class);
    }
}
