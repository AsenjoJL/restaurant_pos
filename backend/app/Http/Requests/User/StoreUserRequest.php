<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array
    {
        return [
            'role_id' => ['required', 'exists:roles,id'],
            'name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'max:50', 'unique:users,username'],
            'email' => ['nullable', 'email', 'unique:users,email'],
            'password' => ['required', Password::defaults()],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
