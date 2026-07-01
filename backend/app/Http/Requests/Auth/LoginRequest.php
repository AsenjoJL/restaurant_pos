<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        if ($this->filled('username') || $this->filled('password')) {
            return;
        }

        $decoded = json_decode($this->getContent(), true);

        if (is_array($decoded)) {
            $this->merge([
                'username' => $decoded['username'] ?? null,
                'password' => $decoded['password'] ?? null,
            ]);
        }
    }

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'username' => ['required', 'string'],
            'password' => ['required', 'string'],
        ];
    }
}
