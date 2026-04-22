import { ingredientsSeed, recipesSeed } from '../../../mock/seed'
import type { Ingredient, InventoryAdjustment, Recipe } from '../inventory.types'
import type { InventoryRepository } from './inventory.repository'
import type { SaveRecipeInput, UpsertIngredientInput } from '../types/contracts'

let ingredientsState: Ingredient[] = structuredClone(ingredientsSeed)
let recipesState: Recipe[] = structuredClone(recipesSeed)
let adjustmentsState: InventoryAdjustment[] = []

export const inventoryRepositoryMock: InventoryRepository = {
  async getSnapshot() {
    return {
      ingredients: structuredClone(ingredientsState),
      recipes: structuredClone(recipesState),
      adjustments: structuredClone(adjustmentsState),
    }
  },
  async listIngredients() {
    return structuredClone(ingredientsState)
  },
  async upsertIngredient(payload: UpsertIngredientInput) {
    if (payload.id) {
      const existing = ingredientsState.find((item) => item.id === payload.id)
      if (existing) {
        Object.assign(existing, payload)
        return structuredClone(existing)
      }

      const created: Ingredient = {
        ...payload,
        id: payload.id,
      }
      ingredientsState = [created, ...ingredientsState]
      return structuredClone(created)
    }
    const created: Ingredient = {
      ...payload,
      id: crypto.randomUUID(),
    }
    ingredientsState = [created, ...ingredientsState]
    return structuredClone(created)
  },
  async listRecipes() {
    return structuredClone(recipesState)
  },
  async saveRecipe(payload: SaveRecipeInput) {
    const existing = recipesState.find((recipe) => recipe.productId === payload.productId)
    if (existing) {
      existing.lines = payload.lines
      existing.updatedAt = new Date().toISOString()
      return structuredClone(existing)
    }
    const created: Recipe = {
      id: crypto.randomUUID(),
      productId: payload.productId,
      lines: payload.lines,
      updatedAt: new Date().toISOString(),
    }
    recipesState = [created, ...recipesState]
    return structuredClone(created)
  },
  async removeRecipe(productId: string) {
    recipesState = recipesState.filter((recipe) => recipe.productId !== productId)
  },
  async createAdjustment(payload: Omit<InventoryAdjustment, 'id' | 'at'>) {
    const created: InventoryAdjustment = {
      ...payload,
      id: crypto.randomUUID(),
      at: new Date().toISOString(),
    }
    adjustmentsState = [created, ...adjustmentsState]
    const target = ingredientsState.find((ingredient) => ingredient.id === payload.ingredientId)
    if (target) {
      const delta = payload.type === 'IN' ? payload.qty : -payload.qty
      target.onHand = Math.max(0, target.onHand + delta)
    }
    return structuredClone(created)
  },
}
