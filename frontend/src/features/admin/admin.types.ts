import type { Role } from '../auth/auth.types'
import type { LiveSyncSettings } from '../../shared/types/live-sync'

export type AdminCategory = {
  id: string
  name: string
  description: string
  isActive: boolean
}

export type AdminProduct = {
  id: string
  sku: string
  name: string
  description: string
  price: number
  baseCost: number
  productClass: 'RAW' | 'NON_RAW'
  categoryId: string
  isActive: boolean
}

export type AdminUser = {
  id: string
  name: string
  username: string
  role: Role
  isActive: boolean
}

export type AdminSettings = {
  storeName: string
  taxRate: number
  serviceChargeRate: number
  receiptFooter: string
  liveSync: LiveSyncSettings
}

export type AdminState = {
  categories: AdminCategory[]
  products: AdminProduct[]
  users: AdminUser[]
  settings: AdminSettings
}
