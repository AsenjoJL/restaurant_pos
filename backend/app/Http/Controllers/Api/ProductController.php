<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Product\StoreProductRequest;
use App\Http\Requests\Product\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Services\AuditLogService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    private const MAX_PER_PAGE = 250;
    private const ALLOWED_SORTS = ['name', 'sku', 'price', 'base_cost', 'created_at', 'updated_at'];

    public function __construct(private readonly AuditLogService $auditLogService) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Product::query()->with(['category', 'inventory', 'recipeItems.ingredient']);

        if ($search = $request->string('search')->toString()) {
            $query->where(fn ($builder) => $builder
                ->where('name', 'like', "%{$search}%")
                ->orWhere('sku', 'like', "%{$search}%"));
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->string('category_id'));
        }

        if ($request->filled('product_class')) {
            $query->where('product_class', $request->string('product_class'));
        }

        $perPage = min(max((int) $request->integer('per_page', 15), 1), self::MAX_PER_PAGE);
        $sort = $request->string('sort')->toString();
        $direction = strtolower($request->string('direction', 'asc')->toString()) === 'desc' ? 'desc' : 'asc';
        $sortColumn = in_array($sort, self::ALLOWED_SORTS, true) ? $sort : 'name';

        return ProductResource::collection(
            $query
                ->orderBy($sortColumn, $direction)
                ->paginate($perPage)
        );
    }

    public function store(StoreProductRequest $request): ProductResource
    {
        Gate::authorize('manager-access');

        $product = DB::transaction(function () use ($request) {
            $data = collect($request->validated())
                ->except('recipe_items')
                ->when(
                    blank($request->validated('sku')),
                    fn ($collection) => $collection->put('sku', $this->generateProductSku($request->validated('product_class')))
                )
                ->when(
                    blank($request->validated('slug')),
                    fn ($collection) => $collection->put('slug', Str::slug((string) $request->validated('name')))
                )
                ->all();
            $product = Product::create($data);
            $this->syncRecipeItems($product, $request->validated('recipe_items', []));

            return $product;
        });

        $this->auditLogService->log('product.created', $product, null, $product->toArray(), 'Product created.', $request);

        return new ProductResource($product->load(['category', 'inventory', 'recipeItems.ingredient']));
    }

    public function uploadImage(Request $request): \Illuminate\Http\JsonResponse
    {
        Gate::authorize('manager-access');

        $validated = $request->validate([
            'image' => [
                'required',
                'file',
                'max:5120',
                'mimes:jpg,jpeg,png,webp,avif',
                'mimetypes:image/jpeg,image/png,image/webp,image/avif',
            ],
        ]);

        $path = $validated['image']->store('products', 'public');

        return response()->json([
            'image_url' => Storage::disk('public')->url($path),
        ]);
    }

    public function show(Product $product): ProductResource
    {
        return new ProductResource($product->load(['category', 'inventory', 'recipeItems.ingredient']));
    }

    public function update(UpdateProductRequest $request, Product $product): ProductResource
    {
        Gate::authorize('manager-access');
        $before = $product->load(['recipeItems'])->toArray();

        DB::transaction(function () use ($request, $product) {
            $product->update(collect($request->validated())->except('recipe_items')->all());
            if ($request->has('recipe_items')) {
                $this->syncRecipeItems($product, $request->validated('recipe_items', []));
            }
        });

        $fresh = $product->fresh()->load(['category', 'inventory', 'recipeItems.ingredient']);
        $this->auditLogService->log('product.updated', $product, $before, $fresh->toArray(), 'Product updated.', $request);

        return new ProductResource($fresh);
    }

    public function destroy(Request $request, Product $product): \Illuminate\Http\JsonResponse
    {
        Gate::authorize('manager-access');
        $before = $product->toArray();
        $product->delete();
        $this->auditLogService->log('product.deleted', $product, $before, null, 'Product deleted.', $request);

        return response()->json([], 204);
    }

    private function syncRecipeItems(Product $product, array $recipeItems): void
    {
        $ingredientUnitMap = Product::query()
            ->with('inventory')
            ->whereIn('id', collect($recipeItems)->pluck('ingredient_product_id')->filter()->all())
            ->get()
            ->mapWithKeys(fn (Product $ingredient) => [
                $ingredient->id => $ingredient->inventory->first()?->unit ?? 'pcs',
            ]);

        $product->recipeItems()->delete();
        $product->recipeItems()->createMany(
            collect($recipeItems)
                ->map(function (array $item) use ($ingredientUnitMap) {
                    $resolvedUnit = filled($item['unit'] ?? null)
                        ? $item['unit']
                        : ($ingredientUnitMap[$item['ingredient_product_id']] ?? 'pcs');

                    return [
                        ...$item,
                        'unit' => $resolvedUnit,
                    ];
                })
                ->all()
        );
    }

    private function generateProductSku(string $productClass): string
    {
        $prefix = $productClass === 'RAW' ? 'RAW' : 'NON';
        $pattern = "PRD-{$prefix}-%";

        $nextSequence = Product::withTrashed()
            ->where('sku', 'like', $pattern)
            ->pluck('sku')
            ->map(function (string $sku) use ($prefix) {
                if (preg_match("/^PRD-{$prefix}-(\d{4})$/", $sku, $matches) === 1) {
                    return (int) $matches[1];
                }

                return 0;
            })
            ->max() + 1;

        do {
            $sku = sprintf('PRD-%s-%04d', $prefix, $nextSequence++);
        } while (Product::withTrashed()->where('sku', $sku)->exists());

        return $sku;
    }
}
