import { createAsyncThunk, createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store/store'
import { getDefaultLiveSyncSettings } from '../../app/config/live-sync'
import { resolveApiAssetUrl } from '../../shared/api/http'
import { isRecord, readLocalStorageJson } from '../../shared/lib/jsonStorage'
import { adminRepository } from './api'
import type {
  AdminSettings,
  AdminState,
  AdminProduct,
  AdminUser,
} from './admin.types'

export const ADMIN_STORAGE_KEY = 'pos.admin.v4'

type CategoryPayload = {
  name: string
  description: string
}

type ProductPayload = {
  id?: string
  name: string
  description: string
  price: number
  baseCost: number
  productClass: 'RAW' | 'NON_RAW'
  categoryId: string
  imageUrl?: string | null
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

const seededState: AdminState = {
  categories: [],
  products: [],
  users: [],
  settings: {
    storeName: 'Harvest Table',
    taxRate: 8.25,
    serviceChargeRate: 5,
    receiptFooter: 'Thank you for dining with us.',
    liveSync: getDefaultLiveSyncSettings(),
  },
}

const loadStoredAdminState = (): AdminState | null => {
  const parsed = readLocalStorageJson<AdminState>(ADMIN_STORAGE_KEY)
  if (
    !isRecord(parsed) ||
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
      imageUrl: resolveApiAssetUrl((product as AdminState['products'][number]).imageUrl) ?? null,
    })),
    settings: {
      ...parsed.settings,
      liveSync: parsed.settings.liveSync ?? getDefaultLiveSyncSettings(),
    },
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
        id: action.payload.id ?? nanoid(),
        sku: generateProductSku(state.products, action.payload.productClass),
        name: action.payload.name,
        description: action.payload.description,
        price: action.payload.price,
        baseCost: action.payload.baseCost,
        productClass: action.payload.productClass,
        categoryId: action.payload.categoryId,
        imageUrl: action.payload.imageUrl ?? null,
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
      target.imageUrl = action.payload.imageUrl ?? null
      target.isActive = action.payload.isActive
    },
    upsertCanonicalProduct: (state, action: PayloadAction<AdminProduct>) => {
      const targetIndex = state.products.findIndex((product) => product.id === action.payload.id)
      if (targetIndex >= 0) {
        state.products[targetIndex] = action.payload
        return
      }

      state.products.unshift(action.payload)
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
  upsertCanonicalProduct,
  toggleProductActive,
  addUser,
  updateUser,
  toggleUserActive,
  updateSettings,
} = adminSlice.actions

export default adminSlice.reducer
