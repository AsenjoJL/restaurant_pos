import { categoriesSeed, productsSeed, usersSeed } from '../../../mock/seed'
import { getDefaultLiveSyncSettings } from '../../../app/config/live-sync'
import type { AdminCategory, AdminProduct, AdminSettings, AdminUser } from '../admin.types'
import type { AdminSnapshot } from '../types/contracts'
import type { AdminRepository } from './admin.repository'

const categoryDescriptions: Record<string, string> = {
  burgers: 'House burgers, grilled to order.',
  pizza: 'Wood-fired pizzas with fresh toppings.',
  salads: 'Fresh greens and seasonal toppings.',
  sides: 'Perfect pairings and snacks.',
  drinks: 'Handcrafted drinks and classics.',
  desserts: 'Sweet finishes for every meal.',
}

let settingsState: AdminSettings = {
  storeName: 'Harvest Table',
  taxRate: 8.25,
  serviceChargeRate: 5,
  receiptFooter: 'Thank you for dining with us.',
  liveSync: getDefaultLiveSyncSettings(),
}

let usersState: AdminUser[] = usersSeed.map((user) => ({
  id: user.id,
  name: user.name,
  username: user.username,
  role: user.role,
  isActive: true,
}))

let categoriesState: AdminCategory[] = categoriesSeed
  .filter((category) => category.id !== 'all')
  .map((category) => ({
    id: category.id,
    name: category.name,
    description: categoryDescriptions[category.id] ?? '',
    isActive: true,
  }))

let productsState: AdminProduct[] = productsSeed.map((product, index) => ({
  id: product.id,
  sku: `PRD-NON-${String(index + 1).padStart(4, '0')}`,
  name: product.name,
  description: product.description,
  price: product.price,
  baseCost: Math.max(product.price * 0.55, 1),
  productClass: product.categoryId === 'raw-materials' ? 'RAW' : 'NON_RAW',
  categoryId: product.categoryId,
  imageUrl: product.image ?? null,
  isActive: true,
}))

export const adminRepositoryMock: AdminRepository = {
  async getSnapshot() {
    return {
      categories: structuredClone(categoriesState),
      products: structuredClone(productsState),
      users: structuredClone(usersState),
      settings: structuredClone(settingsState),
    }
  },
  async saveSnapshot(payload: AdminSnapshot) {
    categoriesState = structuredClone(payload.categories)
    productsState = structuredClone(payload.products)
    usersState = structuredClone(payload.users)
    settingsState = structuredClone(payload.settings)
    return {
      categories: structuredClone(categoriesState),
      products: structuredClone(productsState),
      users: structuredClone(usersState),
      settings: structuredClone(settingsState),
    }
  },
  async saveSettings(payload: AdminSettings) {
    settingsState = structuredClone(payload)
    return structuredClone(settingsState)
  },
  async changeUserPassword() {
    return { updated: true }
  },
  async uploadProductImage(file: File) {
    return {
      imageUrl: URL.createObjectURL(file),
    }
  },
  async listUsers() {
    return structuredClone(usersState)
  },
  async listCategories() {
    return structuredClone(categoriesState)
  },
  async listProducts() {
    return structuredClone(productsState)
  },
}
