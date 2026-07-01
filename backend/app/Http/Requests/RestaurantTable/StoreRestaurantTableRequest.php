<?php

namespace App\Http\Requests\RestaurantTable;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRestaurantTableRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:50', 'unique:restaurant_tables,name'],
            'capacity' => ['required', 'integer', 'min:1'],
            'location' => ['nullable', 'string', 'max:255'],
            'status' => ['sometimes', Rule::in(['AVAILABLE', 'OCCUPIED', 'RESERVED', 'OUT_OF_SERVICE'])],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
