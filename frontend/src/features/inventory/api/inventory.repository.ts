import type { RepositoryResult } from '../../../shared/api/contracts'
import type { Ingredient, InventoryAdjustment, Recipe } from '../inventory.types'
import type { InventorySnapshot, SaveRecipeInput, UpsertIngredientInput } from '../types/contracts'

export interface InventoryRepository {
  getSnapshot(): RepositoryResult<InventorySnapshot>
  listIngredients(): RepositoryResult<Ingredient[]>
  upsertIngredient(payload: UpsertIngredientInput): RepositoryResult<Ingredient>
  listRecipes(): RepositoryResult<Recipe[]>
  saveRecipe(payload: SaveRecipeInput): RepositoryResult<Recipe>
  removeRecipe(productId: string): RepositoryResult<void>
  createAdjustment(
    payload: Omit<InventoryAdjustment, 'id' | 'at'>,
  ): RepositoryResult<InventoryAdjustment>
}
