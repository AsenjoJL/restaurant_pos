import { env } from '../../../app/config/env'
import { httpClient } from '../../../shared/api/http'
import type { Ingredient, InventoryAdjustment, Recipe } from '../inventory.types'
import type { InventoryRepository } from './inventory.repository'
import type { InventorySnapshot, SaveRecipeInput, UpsertIngredientInput } from '../types/contracts'

export const inventoryRepositoryHttp: InventoryRepository = {
  async getSnapshot() {
    return httpClient<InventorySnapshot>(`${env.apiBaseUrl}/inventory/snapshot`)
  },
  async listIngredients() {
    return httpClient<Ingredient[]>(`${env.apiBaseUrl}/inventory/ingredients`)
  },
  async upsertIngredient(payload: UpsertIngredientInput) {
    if (payload.id) {
      return httpClient<Ingredient>(`${env.apiBaseUrl}/inventory/ingredients/${payload.id}`, {
        method: 'PATCH',
        body: payload,
      })
    }
    return httpClient<Ingredient>(`${env.apiBaseUrl}/inventory/ingredients`, {
      method: 'POST',
      body: payload,
    })
  },
  async listRecipes() {
    return httpClient<Recipe[]>(`${env.apiBaseUrl}/inventory/recipes`)
  },
  async saveRecipe(payload: SaveRecipeInput) {
    return httpClient<Recipe>(`${env.apiBaseUrl}/inventory/recipes/${payload.productId}`, {
      method: 'PUT',
      body: payload,
    })
  },
  async removeRecipe(productId: string) {
    await httpClient<void>(`${env.apiBaseUrl}/inventory/recipes/${productId}`, {
      method: 'DELETE',
    })
  },
  async createAdjustment(payload: Omit<InventoryAdjustment, 'id' | 'at'>) {
    return httpClient<InventoryAdjustment>(`${env.apiBaseUrl}/inventory/adjustments`, {
      method: 'POST',
      body: payload,
    })
  },
}
