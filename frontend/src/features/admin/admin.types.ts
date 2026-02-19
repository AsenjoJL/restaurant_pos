import type { Role } from '../auth/auth.types'

export type AdminCategory = {
  id: string
  name: string
  description: string
  isActive: boolean
}

export type AdminProduct = {
  id: string
  name: string
  description: string
  price: number
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
}

export type AdminState = {
  categories: AdminCategory[]
  products: AdminProduct[]
  users: AdminUser[]
  settings: AdminSettings
}
