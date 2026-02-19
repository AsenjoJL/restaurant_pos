import { createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit'
import { categories, products, users } from '../../mock/data'
import type {
  AdminCategory,
  AdminProduct,
  AdminSettings,
  AdminState,
  AdminUser,
} from './admin.types'

type CategoryPayload = {
  name: string
  description: string
}

type ProductPayload = {
  name: string
  description: string
  price: number
  categoryId: string
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

const initialState: AdminState = {
  categories: categories
    .filter((category) => category.id !== 'all')
    .map((category) => ({
      id: category.id,
      name: category.name,
      description: categoryDescriptions[category.id] ?? '',
      isActive: true,
    })),
  products: products.map((product) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    categoryId: product.categoryId,
    isActive: true,
  })),
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
  },
}

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
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
        name: action.payload.name,
        description: action.payload.description,
        price: action.payload.price,
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
      state.settings = action.payload
    },
  },
})

export const {
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
