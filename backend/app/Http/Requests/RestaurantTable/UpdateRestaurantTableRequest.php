<?php

namespace App\Http\Requests\RestaurantTable;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRestaurantTableRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array
    {
        $tableId = $this->route('table')?->id ?? $this->route('table');

        return [
            'name' => ['sometimes', 'string', 'max:50', Rule::unique('restaurant_tables', 'name')->ignore($tableId)],
            'capacity' => ['sometimes', 'integer', 'min:1'],
            'location' => ['nullable', 'string', 'max:255'],
            'status' => ['sometimes', Rule::in(['AVAILABLE', 'OCCUPIED', 'RESERVED', 'OUT_OF_SERVICE'])],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
