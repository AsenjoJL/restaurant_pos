<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Category\StoreCategoryRequest;
use App\Http\Requests\Category\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Services\AuditLogService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

class CategoryController extends Controller
{
    private const MAX_PER_PAGE = 250;

    public function __construct(private readonly AuditLogService $auditLogService) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Category::query()->withCount('products');

        if ($search = $request->string('search')->toString()) {
            $query->where('name', 'like', "%{$search}%");
        }

        $perPage = min(max((int) $request->integer('per_page', 15), 1), self::MAX_PER_PAGE);

        return CategoryResource::collection($query->orderBy('name')->paginate($perPage));
    }

    public function store(StoreCategoryRequest $request): CategoryResource
    {
        Gate::authorize('manager-access');
        $category = Category::create($request->validated());
        $this->auditLogService->log('category.created', $category, null, $category->toArray(), 'Category created.', $request);

        return new CategoryResource($category);
    }

    public function show(Category $category): CategoryResource
    {
        return new CategoryResource($category->loadCount('products'));
    }

    public function update(UpdateCategoryRequest $request, Category $category): CategoryResource
    {
        Gate::authorize('manager-access');
        $before = $category->toArray();
        $category->update($request->validated());
        $this->auditLogService->log('category.updated', $category, $before, $category->fresh()->toArray(), 'Category updated.', $request);

        return new CategoryResource($category->fresh()->loadCount('products'));
    }

    public function destroy(Request $request, Category $category): \Illuminate\Http\JsonResponse
    {
        Gate::authorize('manager-access');
        $before = $category->toArray();
        $category->delete();
        $this->auditLogService->log('category.deleted', $category, $before, null, 'Category deleted.', $request);

        return response()->json([], 204);
    }
}
