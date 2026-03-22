import type { AdminCategory, AdminProduct, AdminSettings, AdminUser } from '../admin.types'

export type AdminSnapshot = {
  categories: AdminCategory[]
  products: AdminProduct[]
  users: AdminUser[]
  settings: AdminSettings
}

