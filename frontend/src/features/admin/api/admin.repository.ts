import type { RepositoryResult } from '../../../shared/api/contracts'
import type { AdminCategory, AdminProduct, AdminSettings, AdminUser } from '../admin.types'
import type { AdminSnapshot } from '../types/contracts'

export interface AdminRepository {
  getSnapshot(): RepositoryResult<AdminSnapshot>
  saveSnapshot(payload: AdminSnapshot): RepositoryResult<AdminSnapshot>
  saveSettings(payload: AdminSettings): RepositoryResult<AdminSettings>
  listUsers(): RepositoryResult<AdminUser[]>
  listCategories(): RepositoryResult<AdminCategory[]>
  listProducts(): RepositoryResult<AdminProduct[]>
}
