<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ReportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function __construct(private readonly ReportService $reportService) {}

    public function sales(Request $request): JsonResponse
    {
        return response()->json([
            'data' => $this->reportService->sales(
                $request->input('period', 'daily'),
                $request->input('from'),
                $request->input('to'),
            ),
        ]);
    }

    public function inventory(): JsonResponse
    {
        return response()->json(['data' => $this->reportService->inventory()]);
    }
}
