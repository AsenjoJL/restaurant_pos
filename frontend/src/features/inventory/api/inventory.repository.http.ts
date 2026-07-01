import { fetchAllLaravelCollection, fetchLaravelCollection, fetchLaravelItem } from '../../../shared/api/laravel'
import type { InventoryRepository } from './inventory.repository'
import type { Ingredient, InventoryAdjustment, Recipe } from '../inventory.types'
import type { InventorySnapshot, SaveRecipeInput, UpsertIngredientInput } from '../types/contracts'

type LaravelInventory = {
  id: string
  product_id: string
  quantity_on_hand: number
  reorder_level: number
  unit_cost: number
  unit: 'g' | 'ml' | 'pcs'
  product?: {
    id: string
    name: string
    sku?: string
    category?: {
      id: string
      name: string
    } | null
  }
}

type LaravelCategory = {
  id: string
  name: string
  slug: string
}

type InventoryResolver = {
  byInventoryId: Map<string, LaravelInventory>
  byProductId: Map<string, LaravelInventory>
  bySku: Map<string, LaravelInventory>
  productCatalogById: Map<string, LaravelProductCatalog>
  productCatalogBySku: Map<string, LaravelProductCatalog>
  productCatalogByName: Map<string, LaravelProductCatalog>
  categoryById: Map<string, LaravelCategory>
  categoryByName: Map<string, LaravelCategory>
}

type LaravelProductCatalog = {
  id: string
  name: string
  sku: string
}

type LaravelProduct = {
  id: string
  recipe_items?: Array<{
    id: string
    ingredient_product_id: string
    quantity_required: number
    unit?: string
  }>
}

type LaravelInventoryAdjustment = {
  id: string
  inventory_id: string
  product_id: string
  order_id?: string | null
  user_id?: string | null
  type: 'IN' | 'OUT'
  reason_type: 'RESTOCK' | 'WASTE' | 'VARIANCE' | 'MANUAL' | 'SALE' | 'RETURN'
  qty: number
  reason?: string | null
  reference?: string | null
  counted_qty?: number | null
  before_qty: number
  after_qty: number
  adjusted_at: string
}

const INVENTORY_PAGE_SIZE = 250
const INVENTORY_ADJUSTMENT_SNAPSHOT_PAGE_SIZE = 200
const INVENTORY_ENDPOINT = `/api/v1/inventory?per_page=${INVENTORY_PAGE_SIZE}`
const PRODUCT_ENDPOINT = `/api/v1/products?per_page=${INVENTORY_PAGE_SIZE}`
const CATEGORY_ENDPOINT = `/api/v1/categories?per_page=${INVENTORY_PAGE_SIZE}`
const INVENTORY_ADJUSTMENT_ENDPOINT = `/api/v1/inventory-adjustments?per_page=${INVENTORY_ADJUSTMENT_SNAPSHOT_PAGE_SIZE}`

let inventoryResolverPromise: Promise<InventoryResolver> | null = null

const normalizeLookupKey = (value: string | undefined | null) => value?.trim().toUpperCase() ?? ''
const normalizeNameKey = (value: string | undefined | null) =>
  value?.trim().toLowerCase().replace(/\s+/g, ' ') ?? ''
const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const canonicalizeInventoryCode = (value: string | undefined | null) => {
  const normalized = normalizeLookupKey(value)
  if (!normalized) {
    return ''
  }

  const compact = normalized.replace(/[^A-Z0-9]/g, '')
  const match = compact.match(/^ING(\d+)$/)

  if (!match) {
    return compact
  }

  return `ING-${match[1].padStart(4, '0')}`
}

const toIngredient = (item: LaravelInventory): Ingredient => ({
  id: item.product_id,
  inventoryId: item.product?.sku ?? item.id,
  name: item.product?.name ?? item.product_id,
  category: item.product?.category?.name ?? 'Inventory',
  baseUnit: item.unit,
  onHand: Number(item.quantity_on_hand),
  reorderLevel: Number(item.reorder_level),
  unitCost: Number(item.unit_cost),
})

const toRecipe = (item: LaravelProduct): Recipe => ({
  id: `recipe-${item.id}`,
  productId: item.id,
  updatedAt: new Date().toISOString(),
  lines: (item.recipe_items ?? []).map((line) => ({
    ingredientId: line.ingredient_product_id,
    qty: Number(line.quantity_required),
    unit: (line.unit as Recipe['lines'][number]['unit']) ?? undefined,
  })),
})

const toInventoryAdjustment = (item: LaravelInventoryAdjustment): InventoryAdjustment => ({
  id: item.id,
  ingredientId: item.product_id,
  type: item.type,
  reasonType: item.reason_type,
  qty: Number(item.qty),
  reason: item.reason ?? '',
  at: item.adjusted_at,
  orderId: item.order_id ?? undefined,
  reference: item.reference ?? undefined,
  countedQty: item.counted_qty ?? undefined,
  beforeQty: Number(item.before_qty),
  afterQty: Number(item.after_qty),
})

const buildInventoryResolver = (
  inventory: LaravelInventory[],
  products: LaravelProductCatalog[],
  categories: LaravelCategory[],
): InventoryResolver => ({
  byInventoryId: new Map(inventory.map((item) => [normalizeLookupKey(item.id), item])),
  byProductId: new Map(inventory.map((item) => [normalizeLookupKey(item.product_id), item])),
  bySku: new Map(
    inventory
      .filter((item) => item.product?.sku)
      .flatMap((item) => {
        const keys = new Set<string>([
          normalizeLookupKey(item.product?.sku),
          canonicalizeInventoryCode(item.product?.sku),
        ])

        return Array.from(keys)
          .filter(Boolean)
          .map((key) => [key, item] as const)
      }),
  ),
  productCatalogById: new Map(products.map((item) => [normalizeLookupKey(item.id), item])),
  productCatalogBySku: new Map(
    products.flatMap((item) => {
      const keys = new Set<string>([
        normalizeLookupKey(item.sku),
        canonicalizeInventoryCode(item.sku),
      ])

      return Array.from(keys)
        .filter(Boolean)
        .map((key) => [key, item] as const)
    }),
  ),
  productCatalogByName: new Map(
    products.map((item) => [normalizeNameKey(item.name), item]),
  ),
  categoryById: new Map(categories.map((item) => [normalizeLookupKey(item.id), item])),
  categoryByName: new Map(categories.map((item) => [normalizeNameKey(item.name), item])),
})

const fetchInventoryResolver = async () => {
  const [inventory, products, categories] = await Promise.all([
    fetchAllLaravelCollection<LaravelInventory>(INVENTORY_ENDPOINT),
    fetchAllLaravelCollection<LaravelProductCatalog>(PRODUCT_ENDPOINT),
    fetchAllLaravelCollection<LaravelCategory>(CATEGORY_ENDPOINT),
  ])

  return buildInventoryResolver(inventory, products, categories)
}

const getInventoryResolver = async () => {
  inventoryResolverPromise ??= fetchInventoryResolver()
  return inventoryResolverPromise
}

const updateResolverInventoryEntry = (
  resolver: InventoryResolver,
  inventory: LaravelInventory,
  matchedProduct?: LaravelProductCatalog,
) => {
  const product = inventory.product ?? (
    matchedProduct
      ? {
          id: matchedProduct.id,
          name: matchedProduct.name,
          sku: matchedProduct.sku,
        }
      : undefined
  )

  const nextInventory: LaravelInventory = {
    ...inventory,
    product,
  }

  resolver.byInventoryId.set(normalizeLookupKey(nextInventory.id), nextInventory)
  resolver.byProductId.set(normalizeLookupKey(nextInventory.product_id), nextInventory)

  const skuKey = product?.sku
  if (skuKey) {
    resolver.bySku.set(normalizeLookupKey(skuKey), nextInventory)
    resolver.bySku.set(canonicalizeInventoryCode(skuKey), nextInventory)
  }
}

const updateResolverProductEntry = (
  resolver: InventoryResolver,
  product: LaravelProductCatalog,
) => {
  resolver.productCatalogById.set(normalizeLookupKey(product.id), product)
  resolver.productCatalogByName.set(normalizeNameKey(product.name), product)

  const skuKeys = new Set([normalizeLookupKey(product.sku), canonicalizeInventoryCode(product.sku)])
  skuKeys.forEach((key) => {
    if (key) {
      resolver.productCatalogBySku.set(key, product)
    }
  })
}

const updateResolverCategoryEntry = (
  resolver: InventoryResolver,
  category: LaravelCategory,
) => {
  resolver.categoryById.set(normalizeLookupKey(category.id), category)
  resolver.categoryByName.set(normalizeNameKey(category.name), category)
}

const ensureCategory = async (resolver: InventoryResolver, categoryName: string) => {
  const existingCategory = resolver.categoryByName.get(normalizeNameKey(categoryName))
  if (existingCategory) {
    return existingCategory
  }

  const createdCategory = await fetchLaravelItem<LaravelCategory>('/api/v1/categories', {
    method: 'POST',
    body: JSON.stringify({
      name: categoryName,
      slug: slugify(categoryName),
      is_active: true,
    }),
  })

  updateResolverCategoryEntry(resolver, createdCategory)

  return createdCategory
}

const buildProductSku = (payload: UpsertIngredientInput) => {
  const inventoryCode = canonicalizeInventoryCode(payload.inventoryId)
  if (inventoryCode) {
    return inventoryCode
  }

  return `ING-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
}

const createProductFromImport = async (
  resolver: InventoryResolver,
  payload: UpsertIngredientInput,
) => {
  const category = await ensureCategory(resolver, payload.category)
  const createdProduct = await fetchLaravelItem<LaravelProductCatalog>('/api/v1/products', {
    method: 'POST',
    body: JSON.stringify({
      category_id: category.id,
      sku: buildProductSku(payload),
      name: payload.name,
      slug: slugify(payload.name),
      product_class: payload.ingredientType ?? 'RAW',
      price: payload.unitCost ?? 0,
      base_cost: payload.unitCost ?? 0,
      track_inventory: true,
      is_active: true,
    }),
  })

  updateResolverProductEntry(resolver, createdProduct)

  return createdProduct
}

const loadSnapshot = async (): Promise<InventorySnapshot> => {
  const [inventory, products, adjustments] = await Promise.all([
    fetchAllLaravelCollection<LaravelInventory>(INVENTORY_ENDPOINT),
    fetchAllLaravelCollection<LaravelProduct>(PRODUCT_ENDPOINT),
    fetchLaravelCollection<LaravelInventoryAdjustment>(INVENTORY_ADJUSTMENT_ENDPOINT),
  ])

  return {
    ingredients: inventory.map(toIngredient),
    recipes: products.filter((item) => (item.recipe_items ?? []).length > 0).map(toRecipe),
    adjustments: adjustments.map(toInventoryAdjustment),
  }
}

export const inventoryRepositoryHttp: InventoryRepository = {
  getSnapshot: loadSnapshot,
  async listIngredients() {
    return (await fetchAllLaravelCollection<LaravelInventory>(INVENTORY_ENDPOINT)).map(toIngredient)
  },
  async upsertIngredient(payload: UpsertIngredientInput) {
    const resolver = await getInventoryResolver()
    const resolvedByProductId = payload.id
      ? resolver.byProductId.get(normalizeLookupKey(payload.id))
      : undefined
    const resolvedByInventoryCode = payload.inventoryId
      ? resolver.bySku.get(normalizeLookupKey(payload.inventoryId)) ??
        resolver.bySku.get(canonicalizeInventoryCode(payload.inventoryId)) ??
        resolver.byInventoryId.get(normalizeLookupKey(payload.inventoryId)) ??
        resolver.byProductId.get(normalizeLookupKey(payload.inventoryId))
      : undefined
    const existingInventory = resolvedByProductId ?? resolvedByInventoryCode
    const matchedProduct =
      (payload.id ? resolver.productCatalogById.get(normalizeLookupKey(payload.id)) : undefined) ??
      (payload.inventoryId
        ? resolver.productCatalogBySku.get(normalizeLookupKey(payload.inventoryId)) ??
          resolver.productCatalogBySku.get(canonicalizeInventoryCode(payload.inventoryId))
        : undefined) ??
      resolver.productCatalogByName.get(normalizeNameKey(payload.name))
    const resolvedProduct =
      matchedProduct ??
      (existingInventory
        ? resolver.productCatalogById.get(normalizeLookupKey(existingInventory.product_id))
        : undefined) ??
      (!existingInventory ? await createProductFromImport(resolver, payload) : undefined)

    const inventoryPayload = {
      product_id: existingInventory?.product_id ?? resolvedProduct?.id ?? payload.id,
      quantity_on_hand: payload.onHand,
      reorder_level: payload.reorderLevel,
      unit_cost: payload.unitCost ?? 0,
      unit: payload.baseUnit,
    }

    if (existingInventory) {
      const updatedInventory = await fetchLaravelItem<LaravelInventory>(
        `/api/v1/inventory/${existingInventory.id}`,
        {
          method: 'PUT',
          body: JSON.stringify(inventoryPayload),
        },
      )

      updateResolverInventoryEntry(resolver, updatedInventory, resolvedProduct)

      return toIngredient(updatedInventory)
    }

    const createdInventory = await fetchLaravelItem<LaravelInventory>('/api/v1/inventory', {
        method: 'POST',
        body: JSON.stringify(inventoryPayload),
      })

    updateResolverInventoryEntry(resolver, createdInventory, resolvedProduct)

    return toIngredient(createdInventory)
  },
  async listRecipes() {
    return (await loadSnapshot()).recipes
  },
  async saveRecipe(payload: SaveRecipeInput) {
    await fetchLaravelItem(`/api/v1/products/${payload.productId}`, {
      method: 'PUT',
      body: JSON.stringify({
        recipe_items: payload.lines.map((line) => ({
          ingredient_product_id: line.ingredientId,
          quantity_required: line.qty,
          unit: line.unit,
        })),
      }),
    })

    return {
      id: `recipe-${payload.productId}`,
      productId: payload.productId,
      updatedAt: new Date().toISOString(),
      lines: payload.lines,
    }
  },
  async removeRecipe(productId: string) {
    await fetchLaravelItem(`/api/v1/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({
        recipe_items: [],
      }),
    })
  },
  async createAdjustment(payload: Omit<InventoryAdjustment, 'id' | 'at'>) {
    const adjustment = await fetchLaravelItem<LaravelInventoryAdjustment>('/api/v1/inventory-adjustments', {
      method: 'POST',
      body: JSON.stringify({
        product_id: payload.ingredientId,
        type: payload.type,
        reason_type: payload.reasonType,
        qty: payload.qty,
        reason: payload.reason,
        order_id: payload.orderId,
        reference: payload.reference,
        counted_qty: payload.countedQty,
      }),
    })

    inventoryResolverPromise = null

    return toInventoryAdjustment(adjustment)
  },
}
