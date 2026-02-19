import { createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit'
import { ingredients as initialIngredients, recipes as initialRecipes } from '../../mock/data'
import type {
  IngredientUnit,
  InventoryAdjustmentType,
  InventoryDeduction,
  InventoryState,
  RecipeLine,
} from './inventory.types'

type IngredientPayload = {
  name: string
  category: string
  unit: IngredientUnit
  onHand: number
  reorderLevel: number
}

type AdjustStockPayload = {
  ingredientId: string
  type: InventoryAdjustmentType
  qty: number
  reason: string
  orderId?: string
}

type SaveRecipePayload = {
  productId: string
  lines: RecipeLine[]
}

type DeductionPayload = {
  orderId: string
  orderNo?: string
  deductions: InventoryDeduction[]
}

const initialState: InventoryState = {
  ingredients: initialIngredients,
  recipes: initialRecipes,
  adjustments: [],
}

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    addIngredient: (state, action: PayloadAction<IngredientPayload>) => {
      state.ingredients.unshift({
        id: nanoid(),
        name: action.payload.name,
        category: action.payload.category,
        unit: action.payload.unit,
        onHand: action.payload.onHand,
        reorderLevel: action.payload.reorderLevel,
      })
    },
    updateIngredient: (
      state,
      action: PayloadAction<{ id: string } & IngredientPayload>,
    ) => {
      const target = state.ingredients.find((item) => item.id === action.payload.id)
      if (!target) {
        return
      }
      target.name = action.payload.name
      target.category = action.payload.category
      target.unit = action.payload.unit
      target.onHand = action.payload.onHand
      target.reorderLevel = action.payload.reorderLevel
    },
    adjustStock: (state, action: PayloadAction<AdjustStockPayload>) => {
      const target = state.ingredients.find(
        (item) => item.id === action.payload.ingredientId,
      )
      if (!target) {
        return
      }
      const delta = action.payload.type === 'IN' ? action.payload.qty : -action.payload.qty
      target.onHand = target.onHand + delta
      state.adjustments.unshift({
        id: nanoid(),
        ingredientId: action.payload.ingredientId,
        type: action.payload.type,
        qty: action.payload.qty,
        reason: action.payload.reason,
        at: new Date().toISOString(),
        orderId: action.payload.orderId,
      })
    },
    saveRecipe: (state, action: PayloadAction<SaveRecipePayload>) => {
      const existing = state.recipes.find(
        (recipe) => recipe.productId === action.payload.productId,
      )
      if (existing) {
        existing.lines = action.payload.lines
        existing.updatedAt = new Date().toISOString()
        return
      }
      state.recipes.unshift({
        id: nanoid(),
        productId: action.payload.productId,
        lines: action.payload.lines,
        updatedAt: new Date().toISOString(),
      })
    },
    removeRecipe: (state, action: PayloadAction<string>) => {
      state.recipes = state.recipes.filter((recipe) => recipe.productId !== action.payload)
    },
    applyInventoryDeductions: (state, action: PayloadAction<DeductionPayload>) => {
      const orderLabel = action.payload.orderNo
        ? `Order ${action.payload.orderNo} payment`
        : 'Order payment'
      action.payload.deductions.forEach((deduction) => {
        const target = state.ingredients.find(
          (item) => item.id === deduction.ingredientId,
        )
        if (!target) {
          return
        }
        target.onHand = target.onHand - deduction.qty
        state.adjustments.unshift({
          id: nanoid(),
          ingredientId: deduction.ingredientId,
          type: 'OUT',
          qty: deduction.qty,
          reason: orderLabel,
          at: new Date().toISOString(),
          orderId: action.payload.orderId,
        })
      })
    },
  },
})

export const {
  addIngredient,
  updateIngredient,
  adjustStock,
  saveRecipe,
  removeRecipe,
  applyInventoryDeductions,
} = inventorySlice.actions

export default inventorySlice.reducer
