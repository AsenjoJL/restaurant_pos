import type { RepositoryResult } from '../../../shared/api/contracts'
import type { AdminCategory, AdminProduct, AdminSettings, AdminUser } from '../admin.types'
import type { AdminSnapshot } from '../types/contracts'

export type AdminProductUpsertPayload = {
  sku?: string
  name: string
  description: string
  price: number
  baseCost: number
  productClass: 'RAW' | 'NON_RAW'
  categoryId: string
  imageUrl?: string | null
  isActive?: boolean
}

export interface AdminRepository {
  getSnapshot(): RepositoryResult<AdminSnapshot>
  saveSnapshot(payload: AdminSnapshot): RepositoryResult<AdminSnapshot>
  saveSettings(payload: AdminSettings): RepositoryResult<AdminSettings>
  createUser(payload: {
    name: string
    username: string
    role: AdminUser['role']
    password: string
    isActive?: boolean
  }): RepositoryResult<AdminUser>
  updateUser(
    userId: string,
    payload: {
      name: string
      username: string
      role: AdminUser['role']
      isActive?: boolean
    },
  ): RepositoryResult<AdminUser>
  setUserActive(userId: string, isActive: boolean): RepositoryResult<AdminUser>
  createProduct(payload: AdminProductUpsertPayload): RepositoryResult<AdminProduct>
  updateProduct(productId: string, payload: AdminProductUpsertPayload): RepositoryResult<AdminProduct>
  changeUserPassword(
    userId: string,
    payload: { newPassword: string; performedByUserId: string },
  ): RepositoryResult<{ updated: boolean }>
  uploadProductImage(file: File): RepositoryResult<{ imageUrl: string }>
  listUsers(): RepositoryResult<AdminUser[]>
  listCategories(): RepositoryResult<AdminCategory[]>
  listProducts(): RepositoryResult<AdminProduct[]>
}
