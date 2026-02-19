import type { RootState } from '../../app/store/store'

export const selectInventoryState = (state: RootState) => state.inventory
export const selectInventoryIngredients = (state: RootState) => state.inventory.ingredients
export const selectInventoryRecipes = (state: RootState) => state.inventory.recipes
export const selectInventoryAdjustments = (state: RootState) => state.inventory.adjustments
