<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RecipeItem extends Model
{
    use HasFactory;
    use HasUlids;

    protected $fillable = ['product_id', 'ingredient_product_id', 'quantity_required', 'unit'];

    protected function casts(): array
    {
        return ['quantity_required' => 'decimal:3'];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function ingredient(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'ingredient_product_id');
    }
}
