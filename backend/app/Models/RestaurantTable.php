<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RestaurantTable extends Model
{
    use HasFactory;
    use HasUlids;

    protected $fillable = ['name', 'capacity', 'location', 'status', 'is_active'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }
}
