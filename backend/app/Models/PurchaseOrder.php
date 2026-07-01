<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class PurchaseOrder extends Model
{
    use HasFactory;
    use HasUlids;
    use SoftDeletes;

    protected $fillable = [
        'supplier_id',
        'created_by',
        'po_number',
        'status',
        'ordered_at',
        'expected_at',
        'received_at',
        'received_inventory_applied_at',
        'subtotal',
        'tax_amount',
        'total_amount',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'ordered_at' => 'date',
            'expected_at' => 'date',
            'received_at' => 'date',
            'received_inventory_applied_at' => 'datetime',
            'subtotal' => 'decimal:2',
            'tax_amount' => 'decimal:2',
            'total_amount' => 'decimal:2',
        ];
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function items(): HasMany
    {
        return $this->hasMany(PurchaseOrderItem::class);
    }
}
