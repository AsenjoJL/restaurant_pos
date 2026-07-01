<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Services\AuditLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function __construct(private readonly AuditLogService $auditLogService) {}

    public function login(Request $request): JsonResponse
    {
        if (Auth::check()) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        $credentials = $request->only(['username', 'password']);

        if (
            (! is_string($credentials['username'] ?? null) || trim($credentials['username']) === '') ||
            (! is_string($credentials['password'] ?? null) || trim($credentials['password']) === '')
        ) {
            $decoded = json_decode($request->getContent(), true);

            if (is_array($decoded)) {
                $credentials['username'] = $decoded['username'] ?? $credentials['username'] ?? null;
                $credentials['password'] = $decoded['password'] ?? $credentials['password'] ?? null;
            }
        }

        if (! is_array($credentials) || ! is_string($credentials['username'] ?? null) || ! is_string($credentials['password'] ?? null)) {
            parse_str((string) $request->getContent(), $parsed);

            if (is_array($parsed)) {
                $credentials['username'] = $parsed['username'] ?? $credentials['username'] ?? null;
                $credentials['password'] = $parsed['password'] ?? $credentials['password'] ?? null;
            }
        }

        $username = is_string($credentials['username'] ?? null) ? trim($credentials['username']) : '';
        $password = is_string($credentials['password'] ?? null) ? (string) $credentials['password'] : '';

        if ($username === '' || $password === '') {
            throw ValidationException::withMessages([
                'username' => ['The username field is required.'],
                'password' => ['The password field is required.'],
            ]);
        }

        if (! Auth::attempt(['username' => $username, 'password' => $password, 'is_active' => true], true)) {
            throw ValidationException::withMessages([
                'username' => ['Invalid credentials.'],
            ]);
        }

        $request->session()->regenerate();

        $user = $request->user()->load('role');
        $user->forceFill(['last_login_at' => now()])->save();

        $this->auditLogService->log('auth.login', $user, null, ['username' => $user->username], 'User logged in.', $request, $user->id);

        return response()->json([
            'message' => 'Authenticated successfully.',
            'token' => 'sanctum-session',
            'user' => UserResource::make($user),
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => UserResource::make($request->user()->load('role')),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();

        $this->auditLogService->log('auth.logout', $user, null, null, 'User logged out.', $request, $user?->id);

        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Logged out successfully.']);
    }
}
