import type { MenuProduct } from '../pos/pos.types'

export type IngredientBaseUnit = 'g' | 'ml' | 'pcs'
export type MeasurementUnit = IngredientBaseUnit | 'kg' | 'l' | 'tbsp' | 'tsp' | 'cup'
export type IngredientType = 'RAW' | 'NON_RAW'

export type Ingredient = {
  id: string
  inventoryId?: string
  ingredientType?: IngredientType
  name: string
  category: string
  baseUnit: IngredientBaseUnit
  onHand: number
  reorderLevel: number
  unitCost?: number
}

export type RecipeLine = {
  ingredientId: string
  qty: number
  unit?: MeasurementUnit
}

export type Recipe = {
  id: string
  productId: MenuProduct['id']
  lines: RecipeLine[]
  updatedAt: string
}

export type InventoryAdjustmentType = 'IN' | 'OUT'
export type InventoryAdjustmentReason =
  | 'RESTOCK'
  | 'WASTE'
  | 'VARIANCE'
  | 'MANUAL'
  | 'SALE'
  | 'RETURN'

export type InventoryAdjustment = {
  id: string
  ingredientId: string
  type: InventoryAdjustmentType
  reasonType: InventoryAdjustmentReason
  qty: number
  reason: string
  at: string
  orderId?: string
  reference?: string
  countedQty?: number
  beforeQty?: number
  afterQty?: number
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
  unit: IngredientBaseUnit
  required: number
  available: number
  deficit: number
  reorderLevel?: number
  reason?: string
}

export type InventoryValidation = {
  ok: boolean
  deductions: InventoryDeduction[]
  shortages: InventoryShortage[]
}
