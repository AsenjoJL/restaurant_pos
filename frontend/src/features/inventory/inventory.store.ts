import { createAsyncThunk, createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store/store'
import type {
  Ingredient,
  IngredientBaseUnit,
  IngredientType,
  InventoryAdjustmentType,
  InventoryAdjustmentReason,
  InventoryDeduction,
  InventoryState,
  RecipeLine,
} from './inventory.types'
import { inventoryRepository } from './api'

export const INVENTORY_STORAGE_KEY = 'pos.inventory.v2'

type IngredientPayload = {
  inventoryId?: string
  ingredientType?: IngredientType
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

const normalizeInventoryId = (value?: string) => value?.trim().toUpperCase() ?? ''
const NON_RAW_CATEGORY_KEYWORDS = ['packaging', 'service item', 'service items', 'supplies']
const NON_RAW_NAME_KEYWORDS = [
  'bag',
  'cup',
  'box',
  'container',
  'straw',
  'napkin',
  'tissue',
  'fork',
  'spoon',
  'lid',
  'wrapper',
]

const inferIngredientType = (name?: string, category?: string): IngredientType | undefined => {
  const normalizedName = name?.toLowerCase().trim() ?? ''
  const normalizedCategory = category?.toLowerCase().trim() ?? ''
  const hasNonRawCategory = NON_RAW_CATEGORY_KEYWORDS.some((keyword) =>
    normalizedCategory.includes(keyword),
  )
  const hasNonRawName = NON_RAW_NAME_KEYWORDS.some((keyword) =>
    normalizedName.includes(keyword),
  )
  if (hasNonRawCategory || hasNonRawName) {
    return 'NON_RAW'
  }
  return undefined
}

const normalizeIngredientType = (
  value: IngredientType | undefined,
  options?: { name?: string; category?: string; fallback?: IngredientType },
): IngredientType => {
  if (value === 'NON_RAW') {
    return 'NON_RAW'
  }
  const inferred = inferIngredientType(options?.name, options?.category)
  if (inferred) {
    return inferred
  }
  if (value === 'RAW') {
    return 'RAW'
  }
  if (options?.fallback === 'NON_RAW') {
    return 'NON_RAW'
  }
  return 'RAW'
}

const getMaxInventorySequence = (ingredients: Ingredient[]) =>
  ingredients.reduce((max, ingredient) => {
    const match = normalizeInventoryId(ingredient.inventoryId).match(/^ING-(\d+)$/)
    if (!match) {
      return max
    }
    const parsed = Number(match[1])
    return Number.isFinite(parsed) ? Math.max(max, parsed) : max
  }, 0)

const createInventoryIdGenerator = (ingredients: Ingredient[]) => {
  let sequence = getMaxInventorySequence(ingredients)
  return () => {
    sequence += 1
    return `ING-${String(sequence).padStart(4, '0')}`
  }
}

const ensureUniqueInventoryId = (
  desired: string | undefined,
  ingredients: Ingredient[],
  excludeIngredientId?: string,
) => {
  const normalizedDesired = normalizeInventoryId(desired)
  const used = new Set(
    ingredients
      .filter((ingredient) => ingredient.id !== excludeIngredientId)
      .map((ingredient) => normalizeInventoryId(ingredient.inventoryId))
      .filter(Boolean),
  )
  if (normalizedDesired && !used.has(normalizedDesired)) {
    return normalizedDesired
  }
  const getNext = createInventoryIdGenerator(ingredients)
  let candidate = getNext()
  while (used.has(candidate)) {
    candidate = getNext()
  }
  return candidate
}

const normalizeIngredients = (ingredients: Ingredient[]) => {
  const used = new Set<string>()
  let sequence = getMaxInventorySequence(ingredients)
  return ingredients.map((ingredient) => {
    let nextInventoryId = normalizeInventoryId(ingredient.inventoryId)
    if (!nextInventoryId || used.has(nextInventoryId)) {
      sequence += 1
      nextInventoryId = `ING-${String(sequence).padStart(4, '0')}`
      while (used.has(nextInventoryId)) {
        sequence += 1
        nextInventoryId = `ING-${String(sequence).padStart(4, '0')}`
      }
    }
    used.add(nextInventoryId)
    return {
      ...ingredient,
      inventoryId: nextInventoryId,
      ingredientType: normalizeIngredientType(ingredient.ingredientType, {
        name: ingredient.name,
        category: ingredient.category,
      }),
    }
  })
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
      ingredients: normalizeIngredients(parsed.ingredients),
      recipes: parsed.recipes,
      adjustments: Array.isArray(parsed.adjustments) ? parsed.adjustments : [],
    } satisfies InventoryState
  } catch {
    return null
  }
}

const initialState: InventoryState =
  loadStoredInventory() ?? {
    ingredients: [],
    recipes: [],
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
      state.ingredients = normalizeIngredients(action.payload.ingredients)
      state.recipes = action.payload.recipes
      state.adjustments = action.payload.adjustments
    },
    addIngredient: (state, action: PayloadAction<IngredientPayload>) => {
      const nextId = nanoid()
      state.ingredients.unshift({
        id: nextId,
        inventoryId: ensureUniqueInventoryId(action.payload.inventoryId, state.ingredients),
        ingredientType: normalizeIngredientType(action.payload.ingredientType, {
          name: action.payload.name,
          category: action.payload.category,
        }),
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
      target.inventoryId = ensureUniqueInventoryId(
        action.payload.inventoryId ?? target.inventoryId,
        state.ingredients,
        target.id,
      )
      target.ingredientType = normalizeIngredientType(
        action.payload.ingredientType,
        {
          name: action.payload.name,
          category: action.payload.category,
          fallback: target.ingredientType,
        },
      )
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
      state.ingredients = normalizeIngredients(action.payload.ingredients)
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
