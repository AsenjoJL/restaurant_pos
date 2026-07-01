<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory;
    use HasUlids;
    use SoftDeletes;

    protected $fillable = [
        'category_id',
        'default_supplier_id',
        'sku',
        'name',
        'slug',
        'description',
        'product_class',
        'price',
        'base_cost',
        'image_url',
        'track_inventory',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'base_cost' => 'decimal:2',
            'track_inventory' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function defaultSupplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class, 'default_supplier_id');
    }

    public function inventory(): HasMany
    {
        return $this->hasMany(Inventory::class);
    }

    public function recipeItems(): HasMany
    {
        return $this->hasMany(RecipeItem::class);
    }

    public function inventoryAdjustments(): HasMany
    {
        return $this->hasMany(InventoryAdjustment::class);
    }
}
