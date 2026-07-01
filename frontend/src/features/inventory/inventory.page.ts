import { convertToBase } from './inventory.conversions'
import { formatIngredientQty } from './inventory.logic'
import type { Ingredient, IngredientType, InventoryAdjustment, Recipe } from './inventory.types'

const canonicalizeInventoryCode = (value?: string | null) => {
  const normalized = value?.trim().toUpperCase() ?? ''
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

export const INVENTORY_INGREDIENT_TYPE_OPTIONS = [
  { value: 'all', label: 'All types' },
  { value: 'RAW', label: 'Ingredient / raw material' },
  { value: 'NON_RAW', label: 'Finished stock / supply' },
] as const

export const INVENTORY_STATUS_OPTIONS = [
  { value: 'all', label: 'All status' },
  { value: 'low', label: 'Below reorder level' },
  { value: 'ok', label: 'Above reorder level' },
] as const

export type IngredientRecipeCoverage = {
  tone: 'neutral' | 'ok' | 'warn'
  label: string
  detail: string
}

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
    const key = canonicalizeInventoryCode(ingredient.inventoryId)
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

export const compareInventoryIngredients = (left: Ingredient, right: Ingredient) => {
  const leftCode = left.inventoryId?.trim().toUpperCase() ?? ''
  const rightCode = right.inventoryId?.trim().toUpperCase() ?? ''

  if (leftCode && rightCode && leftCode !== rightCode) {
    return leftCode.localeCompare(rightCode, undefined, { numeric: true })
  }

  if (leftCode !== rightCode) {
    return leftCode ? -1 : 1
  }

  return left.name.localeCompare(right.name, undefined, { sensitivity: 'base' })
}

export const buildInventoryRecipeCoverageMap = (
  ingredients: Ingredient[],
  recipes: Recipe[],
) => {
  const recipeLinesByIngredient = new Map<string, Recipe['lines']>()

  recipes.forEach((recipe) => {
    recipe.lines.forEach((line) => {
      const existing = recipeLinesByIngredient.get(line.ingredientId) ?? []
      existing.push(line)
      recipeLinesByIngredient.set(line.ingredientId, existing)
    })
  })

  return new Map<string, IngredientRecipeCoverage>(
    ingredients.map((ingredient) => {
      const lines = recipeLinesByIngredient.get(ingredient.id) ?? []

      if (lines.length === 0) {
        return [
          ingredient.id,
          {
            tone: 'neutral',
            label: 'Unused in recipes',
            detail: 'This ingredient is not part of any saved recipe yet.',
          },
        ]
      }

      let maxRequired = 0

      for (const line of lines) {
        const conversion = convertToBase(ingredient, line.qty, line.unit)
        if (!conversion.ok) {
          return [
            ingredient.id,
            {
              tone: 'warn',
              label: 'Recipe issue',
              detail: conversion.reason,
            },
          ]
        }

        maxRequired = Math.max(maxRequired, conversion.baseQty)
      }

      if (ingredient.onHand < maxRequired) {
        return [
          ingredient.id,
          {
            tone: 'warn',
            label: 'Recipe short',
            detail: `One saved recipe needs ${formatIngredientQty(maxRequired, ingredient.baseUnit)} but only ${formatIngredientQty(ingredient.onHand, ingredient.baseUnit)} is on hand.`,
          },
        ]
      }

      return [
        ingredient.id,
        {
          tone: 'ok',
          label: 'Recipe ready',
          detail: `Enough stock for at least one saved recipe use. Highest single-recipe need is ${formatIngredientQty(maxRequired, ingredient.baseUnit)}.`,
        },
      ]
    }),
  )
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

  return ingredients
    .filter((ingredient) => {
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
    .slice()
    .sort(compareInventoryIngredients)
}
