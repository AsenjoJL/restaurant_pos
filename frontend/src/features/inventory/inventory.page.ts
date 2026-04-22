import type { Ingredient, IngredientType, InventoryAdjustment } from './inventory.types'

export const INVENTORY_INGREDIENT_TYPE_OPTIONS = [
  { value: 'all', label: 'All types' },
  { value: 'RAW', label: 'Raw' },
  { value: 'NON_RAW', label: 'Non-raw' },
] as const

export const INVENTORY_STATUS_OPTIONS = [
  { value: 'all', label: 'All status' },
  { value: 'low', label: 'Low stock' },
  { value: 'ok', label: 'Healthy stock' },
] as const

export const buildInventoryCategories = (ingredients: Ingredient[]) => {
  const unique = new Set(ingredients.map((item) => item.category))
  return Array.from(unique).sort()
}

export const buildIngredientLookupByName = (ingredients: Ingredient[]) => {
  const map = new Map<string, Ingredient>()
  ingredients.forEach((ingredient) => {
    map.set(ingredient.name.trim().toLowerCase(), ingredient)
  })
  return map
}

export const buildIngredientLookupByInventoryId = (ingredients: Ingredient[]) => {
  const map = new Map<string, Ingredient>()
  ingredients.forEach((ingredient) => {
    const key = ingredient.inventoryId?.trim().toUpperCase()
    if (key) {
      map.set(key, ingredient)
    }
  })
  return map
}

export const buildInventoryCategoryOptions = (categories: string[]) => [
  { value: 'all', label: 'All categories' },
  ...categories.map((category) => ({ value: category, label: category })),
]

export const buildIngredientCategoryOptions = (categories: string[]) => [
  { value: '', label: 'Select category' },
  ...categories.map((category) => ({ value: category, label: category })),
]

export const buildInventoryIngredientOptions = (ingredients: Ingredient[]) => [
  { value: '', label: 'Select ingredient' },
  ...ingredients.map((item) => ({
    value: item.id,
    label: item.inventoryId ? `${item.inventoryId} - ${item.name}` : item.name,
  })),
]

export const buildInventoryStats = (ingredients: Ingredient[], categoryCount: number) => {
  const lowStock = ingredients.filter((item) => item.onHand <= item.reorderLevel).length
  return {
    total: ingredients.length,
    lowStock,
    categories: categoryCount,
  }
}

export const buildInventoryAlerts = (
  ingredients: Ingredient[],
  adjustments: InventoryAdjustment[],
) => {
  const lowStockItems = ingredients
    .filter((item) => item.onHand <= item.reorderLevel)
    .sort((a, b) => a.onHand - b.onHand)

  const nearReorderItems = ingredients
    .filter(
      (item) =>
        item.onHand > item.reorderLevel &&
        item.reorderLevel > 0 &&
        item.onHand <= item.reorderLevel * 1.25,
    )
    .sort((a, b) => a.onHand - b.onHand)

  const reorderSuggestions = lowStockItems.slice(0, 8).map((item) => {
    const targetLevel = Math.max(item.reorderLevel * 2, item.reorderLevel + 1)
    const suggestedQty = Math.max(0, Math.ceil(targetLevel - item.onHand))
    return {
      ...item,
      suggestedQty,
    }
  })

  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const wasteMap = new Map<string, number>()

  adjustments.forEach((adjustment) => {
    if (adjustment.reasonType !== 'WASTE') {
      return
    }
    const timestamp = new Date(adjustment.at).getTime()
    if (!Number.isFinite(timestamp) || timestamp < sevenDaysAgo) {
      return
    }
    wasteMap.set(adjustment.ingredientId, (wasteMap.get(adjustment.ingredientId) ?? 0) + adjustment.qty)
  })

  const expiryRiskItems = Array.from(wasteMap.entries())
    .map(([ingredientId, wasteQty]) => {
      const ingredient = ingredients.find((item) => item.id === ingredientId)
      if (!ingredient) {
        return null
      }
      return { ingredient, wasteQty }
    })
    .filter((item): item is { ingredient: Ingredient; wasteQty: number } => Boolean(item))
    .sort((a, b) => b.wasteQty - a.wasteQty)
    .slice(0, 6)

  return {
    lowStockItems,
    nearReorderItems,
    reorderSuggestions,
    expiryRiskItems,
  }
}

export const filterInventoryIngredients = ({
  categoryFilter,
  ingredientTypeFilter,
  ingredients,
  query,
  statusFilter,
}: {
  categoryFilter: string
  ingredientTypeFilter: 'all' | IngredientType
  ingredients: Ingredient[]
  query: string
  statusFilter: 'all' | 'low' | 'ok'
}) => {
  const normalized = query.trim().toLowerCase()

  return ingredients.filter((ingredient) => {
    if (categoryFilter !== 'all' && ingredient.category !== categoryFilter) {
      return false
    }

    if (
      ingredientTypeFilter !== 'all' &&
      (ingredient.ingredientType ?? 'RAW') !== ingredientTypeFilter
    ) {
      return false
    }

    const isLow = ingredient.onHand <= ingredient.reorderLevel
    if (statusFilter === 'low' && !isLow) {
      return false
    }
    if (statusFilter === 'ok' && isLow) {
      return false
    }

    if (!normalized) {
      return true
    }

    return (
      ingredient.name.toLowerCase().includes(normalized) ||
      ingredient.inventoryId?.toLowerCase().includes(normalized) === true
    )
  })
}
