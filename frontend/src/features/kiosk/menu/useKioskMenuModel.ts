import { useDeferredValue, useMemo } from 'react'
import type { MenuCategory, MenuProduct } from '../../pos/pos.types'
import type { Ingredient, Recipe } from '../../inventory/inventory.types'
import {
  buildInventoryAvailabilityMap,
  resolveAvailability,
} from '../../inventory/inventory.logic'
import { getModifierGroupsForCategory } from '../kiosk.data'
import { buildCategoryNameMap, filterMenuProducts, getCategoryName } from '../../pos/menu.utils'
import type { AdminProduct } from '../../admin/admin.types'
import type { KioskCartItem } from '../kiosk.utils'

export type KioskMenuModel = {
  activeCategoryName: string
  adminProductIds: Set<string>
  categoryNameMap: Map<string, string>
  deferredSearchTerm: string
  inventoryAvailability: Map<string, 'AVAILABLE' | 'LIMITED' | 'SOLD_OUT' | null>
  recipeProductIds: Set<string>
  requiredErrors: string[]
  visibleProducts: MenuProduct[]
  getModifierGroupCount: (categoryId: string) => number
  resolveProductAvailability: (product: MenuProduct) => 'AVAILABLE' | 'LIMITED' | 'SOLD_OUT'
}

type KioskMenuModelParams = {
  activeCategory: string
  adminProducts: AdminProduct[]
  categories: MenuCategory[]
  ingredients: Ingredient[]
  recipes: Recipe[]
  runtimeProducts: MenuProduct[]
  searchTerm: string
  cart: KioskCartItem[]
}

export function useKioskMenuModel({
  activeCategory,
  adminProducts,
  categories,
  ingredients,
  recipes,
  runtimeProducts,
  searchTerm,
  cart,
}: KioskMenuModelParams): KioskMenuModel {
  const deferredSearchTerm = useDeferredValue(searchTerm)

  const categoryNameMap = useMemo(() => buildCategoryNameMap(categories), [categories])

  const visibleProducts = useMemo(
    () =>
      filterMenuProducts(runtimeProducts, {
        activeCategoryId: activeCategory,
        searchTerm: deferredSearchTerm,
      }),
    [activeCategory, deferredSearchTerm, runtimeProducts],
  )

  const inventoryAvailability = useMemo(
    () =>
      buildInventoryAvailabilityMap(
        runtimeProducts.map((product) => product.id),
        recipes,
        ingredients,
      ),
    [ingredients, recipes, runtimeProducts],
  )

  const adminProductIds = useMemo(
    () => new Set(adminProducts.map((product) => product.id)),
    [adminProducts],
  )

  const recipeProductIds = useMemo(
    () => new Set(recipes.map((recipe) => recipe.productId)),
    [recipes],
  )

  const activeCategoryName = getCategoryName(categoryNameMap, activeCategory, 'Menu')

  const requiredErrors = useMemo(() => {
    return cart.flatMap((item) => {
      const groups = getModifierGroupsForCategory(item.product.categoryId)
      const requiredGroups = groups.filter((group) => group.selection === 'single')
      if (requiredGroups.length === 0) {
        return []
      }
      const missing = requiredGroups.filter(
        (group) =>
          !item.modifiers.some((modifier) => modifier.startsWith(`${group.name}:`)),
      )
      return missing.length > 0 ? [item.product.name] : []
    })
  }, [cart])

  const getModifierGroupCount = (categoryId: string) =>
    getModifierGroupsForCategory(categoryId).length

  const resolveProductAvailability = (product: MenuProduct) => {
    const isAdminManaged = adminProductIds.has(product.id)
    const hasRecipe = recipeProductIds.has(product.id)
    if (isAdminManaged && !hasRecipe) {
      return 'SOLD_OUT'
    }
    return resolveAvailability(
      product.availability,
      inventoryAvailability.get(product.id) ?? null,
    )
  }

  return {
    activeCategoryName,
    adminProductIds,
    categoryNameMap,
    deferredSearchTerm,
    inventoryAvailability,
    recipeProductIds,
    requiredErrors,
    visibleProducts,
    getModifierGroupCount,
    resolveProductAvailability,
  }
}

