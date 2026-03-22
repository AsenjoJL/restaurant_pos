import type { Ingredient, InventoryAdjustment, Recipe } from '../inventory.types'

export type UpsertIngredientInput = Omit<Ingredient, 'id'> & { id?: string }

export type SaveRecipeInput = {
  productId: string
  lines: Recipe['lines']
}

export type InventorySnapshot = {
  ingredients: Ingredient[]
  recipes: Recipe[]
  adjustments: InventoryAdjustment[]
}

