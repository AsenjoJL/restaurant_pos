import { createAsyncThunk, createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store/store'
import { categories, products, users } from '../../mock/data'
import type { MenuProduct } from '../pos/pos.types'
import { getDefaultLiveSyncSettings } from '../../app/config/live-sync'
import { adminRepository } from './api'
import type {
  AdminSettings,
  AdminState,
  AdminUser,
} from './admin.types'

export const ADMIN_STORAGE_KEY = 'pos.admin.v3'

type CategoryPayload = {
  name: string
  description: string
}

type ProductPayload = {
  name: string
  description: string
  price: number
  baseCost: number
  productClass: 'RAW' | 'NON_RAW'
  categoryId: string
}

const buildSkuPrefix = (productClass: 'RAW' | 'NON_RAW') =>
  productClass === 'RAW' ? 'RAW' : 'NON'

const parseSkuSequence = (sku: string, productClass: 'RAW' | 'NON_RAW') => {
  const prefix = buildSkuPrefix(productClass)
  const match = sku.match(new RegExp(`^PRD-${prefix}-(\\d{4})$`))
  if (!match) {
    return 0
  }
  return Number(match[1]) || 0
}

const generateProductSku = (
  existingProducts: AdminState['products'],
  productClass: 'RAW' | 'NON_RAW',
) => {
  const nextSeq =
    existingProducts
      .map((item) => parseSkuSequence(item.sku, productClass))
      .reduce((max, current) => Math.max(max, current), 0) + 1
  const prefix = buildSkuPrefix(productClass)
  return `PRD-${prefix}-${String(nextSeq).padStart(4, '0')}`
}

type UserPayload = {
  name: string
  username: string
  role: AdminUser['role']
}

const categoryDescriptions: Record<string, string> = {
  burgers: 'House burgers, grilled to order.',
  pizza: 'Wood-fired pizzas with fresh toppings.',
  salads: 'Fresh greens and seasonal toppings.',
  sides: 'Perfect pairings and snacks.',
  drinks: 'Handcrafted drinks and classics.',
  desserts: 'Sweet finishes for every meal.',
}

// Intelligent detection of raw materials vs finished products
const isRawMaterialProduct = (product: MenuProduct): boolean => {
  const name = product.name.toLowerCase()
  const isFromIngredientsCategory = product.categoryId?.includes('ingredient')
  
  // Raw material categories/keywords
  const rawKeywords = [
    'beans', 'coffee', 'sugar', 'flour', 'rice', 'oil', 'milk', 'cheese',
    'butter', 'salt', 'spice', 'sauce', 'meat', 'beef', 'chicken', 'pork',
    'fish', 'shrimp', 'vegetable', 'lettuce', 'tomato', 'onion', 'garlic',
    'ingredient', 'raw material', 'base', 'leaf', 'leaves', 'powder'
  ]
  
  // Finished product keywords/patterns (usually prepared dishes)
  const finishedKeywords = [
    'pizza', 'burger', 'sandwich', 'soup', 'salad', 'plate', 'meal',
    'combo', 'rice', 'pasta', 'noodle', 'roll', 'flan', 'cake', 'shake',
    'smoothie', 'coffee', 'tea', 'latte', 'macchiato', 'drink', 'soda'
  ]
  
  // Check for raw material keywords in name
  const hasRawKeyword = rawKeywords.some(kw => 
    name.includes(kw) && !name.includes('burger') && !name.includes('coffee cake')
  )
  
  // Check for finished product keywords
  const hasFinishedKeyword = finishedKeywords.some(kw => name.includes(kw))
  
  // If explicitly in ingredient category, it's raw
  if (isFromIngredientsCategory) {
    return true
  }
  
  // If it has raw keyword and no finished keyword, it's raw
  if (hasRawKeyword && !hasFinishedKeyword) {
    return true
  }
  
  // Price heuristic: raw materials are typically cheaper per unit than finished dishes
  // If price is very low (< ₱50) and not a beverage/side, likely raw
  if (product.price < 50 && !name.includes('drink') && !name.includes('cola') && 
      !name.includes('soda') && !name.includes('tea') && !name.includes('coffee')) {
    // But exclude items that sound like finished meals
    if (!hasFinishedKeyword) {
      return true
    }
  }
  
  // Default: treat as non-raw (finished product)
  return false
}

const seededState: AdminState = {
  categories: categories
    .filter((category) => category.id !== 'all')
    .map((category) => ({
      id: category.id,
      name: category.name,
      description: categoryDescriptions[category.id] ?? '',
      isActive: true,
    })),
  products: products.map((product, index) => {
    const isRaw = isRawMaterialProduct(product)
    return {
      id: product.id,
      sku: isRaw
        ? `PRD-RAW-${String(index + 1).padStart(4, '0')}`
        : `PRD-NON-${String(index + 1).padStart(4, '0')}`,
      name: product.name,
      description: product.description,
      price: product.price,
      baseCost: Math.max(product.price * 0.55, 1),
      productClass: isRaw ? 'RAW' : 'NON_RAW',
      categoryId: product.categoryId,
      isActive: true,
    }
  }),
  users: users.map((user) => ({
    id: user.id,
    name: user.name,
    username: user.username,
    role: user.role,
    isActive: true,
  })),
  settings: {
    storeName: 'Harvest Table',
    taxRate: 8.25,
    serviceChargeRate: 5,
    receiptFooter: 'Thank you for dining with us.',
    liveSync: getDefaultLiveSyncSettings(),
  },
}

const loadStoredAdminState = (): AdminState | null => {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const raw = localStorage.getItem(ADMIN_STORAGE_KEY)
    if (!raw) {
      return null
    }
    const parsed = JSON.parse(raw) as AdminState
    if (!parsed) {
      return null
    }
    if (
      !Array.isArray(parsed.categories) ||
      !Array.isArray(parsed.products) ||
      !Array.isArray(parsed.users) ||
      !parsed.settings
    ) {
      return null
    }
    return {
      ...parsed,
      products: parsed.products.map((product, index) => ({
        ...product,
        sku:
          (product as AdminState['products'][number]).sku ??
          `PRD-NON-${String(index + 1).padStart(4, '0')}`,
        baseCost:
          Number((product as AdminState['products'][number]).baseCost) > 0
            ? Number((product as AdminState['products'][number]).baseCost)
            : Math.max(product.price * 0.55, 1),
        productClass:
          (product as AdminState['products'][number]).productClass === 'RAW'
            ? 'RAW'
            : 'NON_RAW',
      })),
      settings: {
        ...parsed.settings,
        liveSync: parsed.settings.liveSync ?? getDefaultLiveSyncSettings(),
      },
    }
  } catch {
    return null
  }
}

const initialState: AdminState = loadStoredAdminState() ?? seededState

export const hydrateAdminFromRepository = createAsyncThunk(
  'admin/hydrateFromRepository',
  async () => adminRepository.getSnapshot(),
)

export const syncAdminSettings = createAsyncThunk<void, AdminSettings>(
  'admin/syncSettings',
  async (payload) => {
    await adminRepository.saveSettings(payload)
  },
)

export const syncAdminSnapshot = createAsyncThunk<void, void, { state: RootState }>(
  'admin/syncSnapshot',
  async (_, { getState }) => {
    await adminRepository.saveSnapshot(getState().admin)
  },
)

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setAdminState: (state, action: PayloadAction<AdminState>) => {
      state.categories = action.payload.categories
      state.products = action.payload.products
      state.users = action.payload.users
      state.settings = {
        ...action.payload.settings,
        liveSync: action.payload.settings.liveSync ?? getDefaultLiveSyncSettings(),
      }
    },
    addCategory: (state, action: PayloadAction<CategoryPayload>) => {
      state.categories.unshift({
        id: nanoid(),
        name: action.payload.name,
        description: action.payload.description,
        isActive: true,
      })
    },
    updateCategory: (
      state,
      action: PayloadAction<{ id: string } & CategoryPayload & { isActive: boolean }>,
    ) => {
      const target = state.categories.find((category) => category.id === action.payload.id)
      if (!target) {
        return
      }
      target.name = action.payload.name
      target.description = action.payload.description
      target.isActive = action.payload.isActive
    },
    deleteCategory: (state, action: PayloadAction<string>) => {
      state.categories = state.categories.filter((category) => category.id !== action.payload)
    },
    addProduct: (state, action: PayloadAction<ProductPayload>) => {
      state.products.unshift({
        id: nanoid(),
        sku: generateProductSku(state.products, action.payload.productClass),
        name: action.payload.name,
        description: action.payload.description,
        price: action.payload.price,
        baseCost: action.payload.baseCost,
        productClass: action.payload.productClass,
        categoryId: action.payload.categoryId,
        isActive: true,
      })
    },
    updateProduct: (
      state,
      action: PayloadAction<{ id: string } & ProductPayload & { isActive: boolean }>,
    ) => {
      const target = state.products.find((product) => product.id === action.payload.id)
      if (!target) {
        return
      }
      target.name = action.payload.name
      target.description = action.payload.description
      target.price = action.payload.price
      target.baseCost = action.payload.baseCost
      target.productClass = action.payload.productClass
      target.categoryId = action.payload.categoryId
      target.isActive = action.payload.isActive
    },
    toggleProductActive: (state, action: PayloadAction<string>) => {
      const target = state.products.find((product) => product.id === action.payload)
      if (!target) {
        return
      }
      target.isActive = !target.isActive
    },
    addUser: (state, action: PayloadAction<UserPayload>) => {
      state.users.unshift({
        id: nanoid(),
        name: action.payload.name,
        username: action.payload.username,
        role: action.payload.role,
        isActive: true,
      })
    },
    updateUser: (state, action: PayloadAction<{ id: string } & UserPayload>) => {
      const target = state.users.find((user) => user.id === action.payload.id)
      if (!target) {
        return
      }
      target.name = action.payload.name
      target.username = action.payload.username
      target.role = action.payload.role
    },
    toggleUserActive: (state, action: PayloadAction<string>) => {
      const target = state.users.find((user) => user.id === action.payload)
      if (!target) {
        return
      }
      target.isActive = !target.isActive
    },
    resetUserPassword: (state, action: PayloadAction<string>) => {
      const target = state.users.find((user) => user.id === action.payload)
      if (!target) {
        return
      }
    },
    updateSettings: (state, action: PayloadAction<AdminSettings>) => {
      state.settings = {
        ...action.payload,
        liveSync: action.payload.liveSync ?? getDefaultLiveSyncSettings(),
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(hydrateAdminFromRepository.fulfilled, (state, action) => {
      state.categories = action.payload.categories
      state.products = action.payload.products
      state.users = action.payload.users
      state.settings = {
        ...action.payload.settings,
        liveSync: action.payload.settings.liveSync ?? getDefaultLiveSyncSettings(),
      }
    })
  },
})

export const {
  setAdminState,
  addCategory,
  updateCategory,
  deleteCategory,
  addProduct,
  updateProduct,
  toggleProductActive,
  addUser,
  updateUser,
  toggleUserActive,
  resetUserPassword,
  updateSettings,
} = adminSlice.actions

export default adminSlice.reducer
