import { getDefaultLiveSyncSettings } from '../../../app/config/live-sync'
import { fetchAllLaravelCollection, fetchLaravelCollection, fetchLaravelItem } from '../../../shared/api/laravel'
import { apiFetch, resolveApiAssetUrl } from '../../../shared/api/http'
import type { AdminCategory, AdminProduct, AdminSettings, AdminUser } from '../admin.types'
import type { AdminSnapshot } from '../types/contracts'
import type { AdminProductUpsertPayload, AdminRepository } from './admin.repository'

type LaravelCategory = {
  id: string
  name: string
  description: string | null
  is_active: boolean
}

type LaravelProduct = {
  id: string
  sku: string
  name: string
  description: string | null
  price: number
  base_cost: number
  product_class: 'RAW' | 'NON_RAW'
  category_id: string
  image_url?: string | null
  is_active: boolean
}

type LaravelUser = {
  id: string
  name: string
  username: string
  role: 'admin' | 'manager' | 'cashier' | 'kitchen'
  is_active: boolean
}

type LaravelRole = {
  id: string
  slug: 'admin' | 'manager' | 'cashier' | 'kitchen'
}

type LaravelSetting = {
  group: string
  key: string
  value: { value?: unknown } | unknown
}

const ADMIN_PAGE_SIZE = 250
const ADMIN_CATEGORIES_ENDPOINT = `/api/v1/categories?per_page=${ADMIN_PAGE_SIZE}`
const ADMIN_PRODUCTS_ENDPOINT = `/api/v1/products?per_page=${ADMIN_PAGE_SIZE}&product_class=NON_RAW`
const ADMIN_USERS_ENDPOINT = `/api/v1/users?per_page=${ADMIN_PAGE_SIZE}`
const ADMIN_SETTINGS_ENDPOINT = `/api/v1/settings?per_page=${ADMIN_PAGE_SIZE}`

const mapRole = (role: LaravelUser['role']): AdminUser['role'] => {
  if (role === 'kitchen') {
    return 'kitchen'
  }

  if (role === 'cashier') {
    return 'cashier'
  }

  return 'admin'
}

const mapCategory = (item: LaravelCategory): AdminCategory => ({
  id: item.id,
  name: item.name,
  description: item.description ?? '',
  isActive: item.is_active,
})

const mapProduct = (item: LaravelProduct): AdminProduct => ({
  id: item.id,
  sku: item.sku,
  name: item.name,
  description: item.description ?? '',
  price: Number(item.price),
  baseCost: Number(item.base_cost),
  productClass: item.product_class,
  categoryId: item.category_id,
  imageUrl: resolveApiAssetUrl(item.image_url),
  isActive: item.is_active,
})

const serializeProductPayload = (payload: AdminProductUpsertPayload) => ({
  ...(payload.sku ? { sku: payload.sku } : {}),
  name: payload.name,
  description: payload.description,
  price: payload.price,
  base_cost: payload.baseCost,
  product_class: payload.productClass,
  category_id: payload.categoryId,
  image_url: payload.imageUrl ?? null,
  is_active: payload.isActive ?? true,
  track_inventory: true,
})

const mapUser = (item: LaravelUser): AdminUser => ({
  id: item.id,
  name: item.name,
  username: item.username,
  role: mapRole(item.role),
  isActive: item.is_active,
})

const settingValue = (entry?: LaravelSetting) => {
  if (!entry) {
    return undefined
  }

  return typeof entry.value === 'object' && entry.value !== null && 'value' in entry.value
    ? entry.value.value
    : entry.value
}

const mapSettings = (items: LaravelSetting[]): AdminSettings => {
  const find = (group: string, key: string) =>
    items.find((item) => item.group === group && item.key === key)

  const liveSyncDefaults = getDefaultLiveSyncSettings()

  return {
    storeName: String(settingValue(find('store', 'name')) ?? 'Restaurant POS'),
    taxRate: Number(settingValue(find('tax', 'rate')) ?? 0),
    serviceChargeRate: Number(settingValue(find('service_charge', 'rate')) ?? 0),
    receiptFooter: String(settingValue(find('receipt', 'footer')) ?? 'Thank you for dining with us.'),
    liveSync: {
      kitchenIntervalMs: Number(settingValue(find('live_sync', 'kitchen_interval_ms')) ?? liveSyncDefaults.kitchenIntervalMs),
      salesIntervalMs: Number(settingValue(find('live_sync', 'sales_interval_ms')) ?? liveSyncDefaults.salesIntervalMs),
      ordersIntervalMs: Number(settingValue(find('live_sync', 'orders_interval_ms')) ?? liveSyncDefaults.ordersIntervalMs),
      backoffMultiplier: Number(settingValue(find('live_sync', 'backoff_multiplier')) ?? liveSyncDefaults.backoffMultiplier),
      maxIntervalMultiplier: Number(settingValue(find('live_sync', 'max_interval_multiplier')) ?? liveSyncDefaults.maxIntervalMultiplier),
      jitterRatio: Number(settingValue(find('live_sync', 'jitter_ratio')) ?? liveSyncDefaults.jitterRatio),
    },
  }
}

const loadSnapshot = async (): Promise<AdminSnapshot> => {
  const [categories, products, users, settings] = await Promise.all([
    fetchAllLaravelCollection<LaravelCategory>(ADMIN_CATEGORIES_ENDPOINT),
    fetchAllLaravelCollection<LaravelProduct>(ADMIN_PRODUCTS_ENDPOINT),
    fetchAllLaravelCollection<LaravelUser>(ADMIN_USERS_ENDPOINT),
    fetchAllLaravelCollection<LaravelSetting>(ADMIN_SETTINGS_ENDPOINT),
  ])

  return {
    categories: categories.map(mapCategory),
    products: products.map(mapProduct),
    users: users.map(mapUser),
    settings: mapSettings(settings),
  }
}

const syncSettings = async (payload: AdminSettings) => {
  await apiFetch('/api/v1/settings', {
    method: 'POST',
    body: JSON.stringify({
      settings: [
        { group: 'store', key: 'name', value: payload.storeName },
        { group: 'tax', key: 'rate', value: payload.taxRate },
        { group: 'service_charge', key: 'rate', value: payload.serviceChargeRate },
        { group: 'receipt', key: 'footer', value: payload.receiptFooter },
        { group: 'live_sync', key: 'kitchen_interval_ms', value: payload.liveSync.kitchenIntervalMs },
        { group: 'live_sync', key: 'sales_interval_ms', value: payload.liveSync.salesIntervalMs },
        { group: 'live_sync', key: 'orders_interval_ms', value: payload.liveSync.ordersIntervalMs },
        { group: 'live_sync', key: 'backoff_multiplier', value: payload.liveSync.backoffMultiplier },
        { group: 'live_sync', key: 'max_interval_multiplier', value: payload.liveSync.maxIntervalMultiplier },
        { group: 'live_sync', key: 'jitter_ratio', value: payload.liveSync.jitterRatio },
      ],
    }),
  })
}

const syncCategories = async (remote: AdminCategory[], incoming: AdminCategory[]) => {
  const remoteById = new Map(remote.map((item) => [item.id, item]))

  for (const category of incoming) {
    const body = {
      name: category.name,
      description: category.description,
      is_active: category.isActive,
    }

    if (remoteById.has(category.id)) {
      await apiFetch(`/api/v1/categories/${category.id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      })
    } else {
      await apiFetch('/api/v1/categories', {
        method: 'POST',
        body: JSON.stringify(body),
      })
    }
  }

  for (const category of remote) {
    if (!incoming.some((item) => item.id === category.id)) {
      await apiFetch(`/api/v1/categories/${category.id}`, {
        method: 'DELETE',
        expectNoContent: true,
      })
    }
  }
}

const syncProducts = async (remote: AdminProduct[], incoming: AdminProduct[]) => {
  const remoteById = new Map(remote.map((item) => [item.id, item]))

  for (const product of incoming) {
    const body = {
      sku: product.sku,
      name: product.name,
      description: product.description,
      price: product.price,
      base_cost: product.baseCost,
      product_class: product.productClass,
      category_id: product.categoryId,
      image_url: product.imageUrl ?? null,
      is_active: product.isActive,
      track_inventory: true,
    }

    if (remoteById.has(product.id)) {
      await apiFetch(`/api/v1/products/${product.id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      })
    } else {
      await apiFetch('/api/v1/products', {
        method: 'POST',
        body: JSON.stringify(body),
      })
    }
  }

  for (const product of remote) {
    if (!incoming.some((item) => item.id === product.id)) {
      await apiFetch(`/api/v1/products/${product.id}`, {
        method: 'DELETE',
        expectNoContent: true,
      })
    }
  }
}

const syncUsers = async (remote: AdminUser[], incoming: AdminUser[]) => {
  const remoteById = new Map(remote.map((item) => [item.id, item]))
  const roles = await fetchLaravelCollection<LaravelRole>('/api/v1/roles?per_page=50')
  const roleIdBySlug = new Map(roles.map((role) => [role.slug, role.id]))

  const toBackendRole = (role: AdminUser['role']): LaravelRole['slug'] =>
    role === 'kitchen' ? 'kitchen' : role === 'cashier' ? 'cashier' : 'admin'

  for (const user of incoming) {
    const roleId = roleIdBySlug.get(toBackendRole(user.role))
    if (!roleId) {
      continue
    }

    const body = {
      name: user.name,
      username: user.username,
      role_id: roleId,
      is_active: user.isActive,
      ...(remoteById.has(user.id) ? {} : { password: 'password123' }),
    }

    if (remoteById.has(user.id)) {
      await apiFetch(`/api/v1/users/${user.id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      })
    } else {
      await apiFetch('/api/v1/users', {
        method: 'POST',
        body: JSON.stringify(body),
      })
    }
  }

  for (const user of remote) {
    if (!incoming.some((item) => item.id === user.id)) {
      await apiFetch(`/api/v1/users/${user.id}`, {
        method: 'DELETE',
        expectNoContent: true,
      })
    }
  }
}

export const adminRepositoryHttp: AdminRepository = {
  getSnapshot: loadSnapshot,
  async saveSnapshot(payload) {
    const remote = await loadSnapshot()

    await syncCategories(remote.categories, payload.categories)
    await syncProducts(remote.products, payload.products)
    await syncUsers(remote.users, payload.users)
    await syncSettings(payload.settings)

    return loadSnapshot()
  },
  async saveSettings(payload) {
    await syncSettings(payload)
    return payload
  },
  async createUser(payload) {
    const roles = await fetchLaravelCollection<LaravelRole>('/api/v1/roles?per_page=50')
    const roleIdBySlug = new Map(roles.map((role) => [role.slug, role.id]))
    const roleSlug: LaravelRole['slug'] =
      payload.role === 'kitchen' ? 'kitchen' : payload.role === 'cashier' ? 'cashier' : 'admin'
    const roleId = roleIdBySlug.get(roleSlug)

    if (!roleId) {
      throw new Error('Selected role is not available.')
    }

    const user = await fetchLaravelItem<LaravelUser>('/api/v1/users', {
      method: 'POST',
      body: JSON.stringify({
        name: payload.name,
        username: payload.username,
        role_id: roleId,
        password: payload.password,
        is_active: payload.isActive ?? true,
      }),
    })

    return mapUser(user)
  },
  async updateUser(userId, payload) {
    const roles = await fetchLaravelCollection<LaravelRole>('/api/v1/roles?per_page=50')
    const roleIdBySlug = new Map(roles.map((role) => [role.slug, role.id]))
    const roleSlug: LaravelRole['slug'] =
      payload.role === 'kitchen' ? 'kitchen' : payload.role === 'cashier' ? 'cashier' : 'admin'
    const roleId = roleIdBySlug.get(roleSlug)

    if (!roleId) {
      throw new Error('Selected role is not available.')
    }

    const user = await fetchLaravelItem<LaravelUser>(`/api/v1/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: payload.name,
        username: payload.username,
        role_id: roleId,
        is_active: payload.isActive ?? true,
      }),
    })

    return mapUser(user)
  },
  async setUserActive(userId, isActive) {
    const currentUsers = await fetchAllLaravelCollection<LaravelUser>(ADMIN_USERS_ENDPOINT)
    const existing = currentUsers.find((user) => user.id === userId)

    if (!existing) {
      throw new Error('User not found.')
    }

    const roles = await fetchLaravelCollection<LaravelRole>('/api/v1/roles?per_page=50')
    const roleIdBySlug = new Map(roles.map((role) => [role.slug, role.id]))
    const roleId = roleIdBySlug.get(existing.role)

    if (!roleId) {
      throw new Error('User role is not available.')
    }

    const user = await fetchLaravelItem<LaravelUser>(`/api/v1/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: existing.name,
        username: existing.username,
        role_id: roleId,
        is_active: isActive,
      }),
    })

    return mapUser(user)
  },
  async createProduct(payload) {
    const product = await fetchLaravelItem<LaravelProduct>('/api/v1/products', {
      method: 'POST',
      body: JSON.stringify(serializeProductPayload(payload)),
    })

    return mapProduct(product)
  },
  async updateProduct(productId, payload) {
    const product = await fetchLaravelItem<LaravelProduct>(`/api/v1/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(serializeProductPayload(payload)),
    })

    return mapProduct(product)
  },
  async changeUserPassword(userId, payload) {
    await apiFetch(`/api/v1/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ password: payload.newPassword }),
    })

    return { updated: true }
  },
  async uploadProductImage(file) {
    const formData = new FormData()
    formData.append('image', file)

    const response = await apiFetch<{ image_url: string }>('/api/v1/products/upload-image', {
      method: 'POST',
      body: formData,
    })

    return {
      imageUrl: resolveApiAssetUrl(response.image_url) ?? response.image_url,
    }
  },
  async listUsers() {
    return (await fetchAllLaravelCollection<LaravelUser>(ADMIN_USERS_ENDPOINT)).map(mapUser)
  },
  async listCategories() {
    return (await fetchAllLaravelCollection<LaravelCategory>(ADMIN_CATEGORIES_ENDPOINT)).map(mapCategory)
  },
  async listProducts() {
    return (await fetchAllLaravelCollection<LaravelProduct>(ADMIN_PRODUCTS_ENDPOINT)).map(mapProduct)
  },
}
