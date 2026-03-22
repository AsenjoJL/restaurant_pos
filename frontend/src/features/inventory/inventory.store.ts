import { createAsyncThunk, createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit'
import { ingredients as initialIngredients, recipes as initialRecipes } from '../../mock/data'
import type { RootState } from '../../app/store/store'
import type {
  IngredientBaseUnit,
  InventoryAdjustmentType,
  InventoryAdjustmentReason,
  InventoryDeduction,
  InventoryState,
  RecipeLine,
} from './inventory.types'
import { inventoryRepository } from './api'

export const INVENTORY_STORAGE_KEY = 'pos.inventory.v1'

type IngredientPayload = {
  name: string
  category: string
  baseUnit: IngredientBaseUnit
  onHand: number
  reorderLevel: number
  unitCost?: number
}

type AdjustStockPayload = {
  ingredientId: string
  type: InventoryAdjustmentType
  reasonType: InventoryAdjustmentReason
  qty: number
  reason: string
  orderId?: string
  reference?: string
  countedQty?: number
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

const loadStoredInventory = () => {
  if (typeof window === 'undefined') {
    return null
  }
  try {
    const raw = localStorage.getItem(INVENTORY_STORAGE_KEY)
    if (!raw) {
      return null
    }
    const parsed = JSON.parse(raw) as InventoryState
    if (!parsed || !Array.isArray(parsed.ingredients) || !Array.isArray(parsed.recipes)) {
      return null
    }
    return {
      ingredients: parsed.ingredients,
      recipes: parsed.recipes,
      adjustments: Array.isArray(parsed.adjustments) ? parsed.adjustments : [],
    } satisfies InventoryState
  } catch {
    return null
  }
}

const initialState: InventoryState =
  loadStoredInventory() ?? {
    ingredients: initialIngredients,
    recipes: initialRecipes,
    adjustments: [],
  }

export const hydrateInventoryFromRepository = createAsyncThunk(
  'inventory/hydrateFromRepository',
  async () => inventoryRepository.getSnapshot(),
)

export const syncUpsertIngredient = createAsyncThunk<
  void,
  ({ id: string } & IngredientPayload) | IngredientPayload
>('inventory/syncUpsertIngredient', async (payload) => {
  await inventoryRepository.upsertIngredient(payload)
})

export const syncStockAdjustment = createAsyncThunk<void, AdjustStockPayload>(
  'inventory/syncStockAdjustment',
  async (payload) => {
    await inventoryRepository.createAdjustment(payload)
  },
)

export const syncSaveRecipe = createAsyncThunk<void, SaveRecipePayload>(
  'inventory/syncSaveRecipe',
  async (payload) => {
    await inventoryRepository.saveRecipe(payload)
  },
)

export const syncRemoveRecipe = createAsyncThunk<void, string>(
  'inventory/syncRemoveRecipe',
  async (productId) => {
    await inventoryRepository.removeRecipe(productId)
  },
)

export const syncSaleDeductions = createAsyncThunk<
  void,
  DeductionPayload,
  { state: RootState }
>('inventory/syncSaleDeductions', async (payload, { getState }) => {
  const ingredientMap = new Map(
    getState().inventory.ingredients.map((ingredient) => [ingredient.id, ingredient]),
  )
  const label = payload.orderNo ? `Order ${payload.orderNo} payment` : 'Order payment'

  await Promise.all(
    payload.deductions.map(async (deduction) => {
      const ingredient = ingredientMap.get(deduction.ingredientId)
      if (!ingredient) {
        return
      }
      await inventoryRepository.createAdjustment({
        ingredientId: deduction.ingredientId,
        type: 'OUT',
        reasonType: 'SALE',
        qty: deduction.qty,
        reason: label,
        orderId: payload.orderId,
      })
    }),
  )
})

export const syncReturnDeductions = createAsyncThunk<
  void,
  DeductionPayload,
  { state: RootState }
>('inventory/syncReturnDeductions', async (payload) => {
  const label = payload.orderNo ? `Order ${payload.orderNo} refund` : 'Order refund'

  await Promise.all(
    payload.deductions.map(async (deduction) => {
      await inventoryRepository.createAdjustment({
        ingredientId: deduction.ingredientId,
        type: 'IN',
        reasonType: 'RETURN',
        qty: deduction.qty,
        reason: label,
        orderId: payload.orderId,
      })
    }),
  )
})

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    setInventoryState: (state, action: PayloadAction<InventoryState>) => {
      state.ingredients = action.payload.ingredients
      state.recipes = action.payload.recipes
      state.adjustments = action.payload.adjustments
    },
    addIngredient: (state, action: PayloadAction<IngredientPayload>) => {
      state.ingredients.unshift({
        id: nanoid(),
        name: action.payload.name,
        category: action.payload.category,
        baseUnit: action.payload.baseUnit,
        onHand: action.payload.onHand,
        reorderLevel: action.payload.reorderLevel,
        unitCost: action.payload.unitCost ?? 0,
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
      target.baseUnit = action.payload.baseUnit
      target.onHand = action.payload.onHand
      target.reorderLevel = action.payload.reorderLevel
      target.unitCost = action.payload.unitCost ?? 0
    },
    adjustStock: (state, action: PayloadAction<AdjustStockPayload>) => {
      const target = state.ingredients.find(
        (item) => item.id === action.payload.ingredientId,
      )
      if (!target) {
        return
      }
      const delta = action.payload.type === 'IN' ? action.payload.qty : -action.payload.qty
      const beforeQty = target.onHand
      target.onHand = target.onHand + delta
      state.adjustments.unshift({
        id: nanoid(),
        ingredientId: action.payload.ingredientId,
        type: action.payload.type,
        reasonType: action.payload.reasonType,
        qty: action.payload.qty,
        reason: action.payload.reason,
        at: new Date().toISOString(),
        orderId: action.payload.orderId,
        reference: action.payload.reference,
        countedQty: action.payload.countedQty,
        beforeQty,
        afterQty: target.onHand,
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
        const beforeQty = target.onHand
        target.onHand = target.onHand - deduction.qty
        state.adjustments.unshift({
          id: nanoid(),
          ingredientId: deduction.ingredientId,
          type: 'OUT',
          reasonType: 'SALE',
          qty: deduction.qty,
          reason: orderLabel,
          at: new Date().toISOString(),
          orderId: action.payload.orderId,
          beforeQty,
          afterQty: target.onHand,
        })
      })
    },
    applyInventoryReturns: (state, action: PayloadAction<DeductionPayload>) => {
      const orderLabel = action.payload.orderNo
        ? `Order ${action.payload.orderNo} refund`
        : 'Order refund'
      action.payload.deductions.forEach((deduction) => {
        const target = state.ingredients.find(
          (item) => item.id === deduction.ingredientId,
        )
        if (!target) {
          return
        }
        const beforeQty = target.onHand
        target.onHand = target.onHand + deduction.qty
        state.adjustments.unshift({
          id: nanoid(),
          ingredientId: deduction.ingredientId,
          type: 'IN',
          reasonType: 'RETURN',
          qty: deduction.qty,
          reason: orderLabel,
          at: new Date().toISOString(),
          orderId: action.payload.orderId,
          beforeQty,
          afterQty: target.onHand,
        })
      })
    },
  },
  extraReducers: (builder) => {
    builder.addCase(hydrateInventoryFromRepository.fulfilled, (state, action) => {
      state.ingredients = action.payload.ingredients
      state.recipes = action.payload.recipes
      state.adjustments = action.payload.adjustments
    })
  },
})

export const {
  setInventoryState,
  addIngredient,
  updateIngredient,
  adjustStock,
  saveRecipe,
  removeRecipe,
  applyInventoryDeductions,
  applyInventoryReturns,
} = inventorySlice.actions

export default inventorySlice.reducer
