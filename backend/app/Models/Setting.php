<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    use HasFactory;
    use HasUlids;

    protected $fillable = ['group', 'key', 'value'];

    protected function casts(): array
    {
        return ['value' => 'array'];
    }
}
