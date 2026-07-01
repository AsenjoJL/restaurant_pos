<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array
    {
        $userId = $this->route('user')?->id ?? $this->route('user');

        return [
            'role_id' => ['sometimes', 'exists:roles,id'],
            'name' => ['sometimes', 'string', 'max:255'],
            'username' => ['sometimes', 'string', 'max:50', Rule::unique('users', 'username')->ignore($userId)],
            'email' => ['nullable', 'email', Rule::unique('users', 'email')->ignore($userId)],
            'password' => ['nullable', Password::defaults()],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
