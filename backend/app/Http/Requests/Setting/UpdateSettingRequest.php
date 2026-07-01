<?php

namespace App\Http\Requests\Setting;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSettingRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array
    {
        return [
            'settings' => ['required', 'array', 'min:1'],
            'settings.*.group' => ['required', 'string', 'max:100'],
            'settings.*.key' => ['required', 'string', 'max:100'],
            'settings.*.value' => ['required'],
        ];
    }
}
