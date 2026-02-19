import type { MenuProduct } from '../pos/pos.types'

export type IngredientUnit = 'g' | 'kg' | 'ml' | 'l' | 'pcs'

export type Ingredient = {
  id: string
  name: string
  category: string
  unit: IngredientUnit
  onHand: number
  reorderLevel: number
}

export type RecipeLine = {
  ingredientId: string
  qty: number
}

export type Recipe = {
  id: string
  productId: MenuProduct['id']
  lines: RecipeLine[]
  updatedAt: string
}

export type InventoryAdjustmentType = 'IN' | 'OUT'

export type InventoryAdjustment = {
  id: string
  ingredientId: string
  type: InventoryAdjustmentType
  qty: number
  reason: string
  at: string
  orderId?: string
}

export type InventoryState = {
  ingredients: Ingredient[]
  recipes: Recipe[]
  adjustments: InventoryAdjustment[]
}

export type InventoryDeduction = {
  ingredientId: string
  qty: number
}

export type InventoryShortage = {
  ingredientId: string
  name: string
  unit: IngredientUnit
  required: number
  available: number
  deficit: number
}

export type InventoryValidation = {
  ok: boolean
  deductions: InventoryDeduction[]
  shortages: InventoryShortage[]
}
