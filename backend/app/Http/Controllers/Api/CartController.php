<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Discount;
use App\Services\CheckoutService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function __construct(private readonly CheckoutService $checkoutService) {}

    public function quote(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.price' => ['required', 'numeric', 'min:0'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'discount_id' => ['nullable', 'exists:discounts,id'],
            'tax_rate' => ['nullable', 'numeric', 'min:0'],
            'service_charge_rate' => ['nullable', 'numeric', 'min:0'],
        ]);

        $discount = isset($validated['discount_id']) ? Discount::find($validated['discount_id']) : null;

        return response()->json([
            'data' => $this->checkoutService->quote(
                $validated['items'],
                $discount,
                (float) ($validated['tax_rate'] ?? 0.12),
                (float) ($validated['service_charge_rate'] ?? 0),
            ),
        ]);
    }
}
