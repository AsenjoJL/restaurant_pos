import { env } from '../../../app/config/env'
import { httpClient } from '../../../shared/api/http'
import type { AdminCategory, AdminProduct, AdminSettings, AdminUser } from '../admin.types'
import type { AdminRepository } from './admin.repository'
import type { AdminSnapshot } from '../types/contracts'

export const adminRepositoryHttp: AdminRepository = {
  async getSnapshot() {
    return httpClient<AdminSnapshot>(`${env.apiBaseUrl}/admin/snapshot`)
  },
  async saveSnapshot(payload: AdminSnapshot) {
    return httpClient<AdminSnapshot>(`${env.apiBaseUrl}/admin/snapshot`, {
      method: 'PUT',
      body: payload,
    })
  },
  async saveSettings(payload: AdminSettings) {
    return httpClient<AdminSettings>(`${env.apiBaseUrl}/admin/settings`, {
      method: 'PUT',
      body: payload,
    })
  },
  async listUsers() {
    return httpClient<AdminUser[]>(`${env.apiBaseUrl}/admin/users`)
  },
  async listCategories() {
    return httpClient<AdminCategory[]>(`${env.apiBaseUrl}/admin/categories`)
  },
  async listProducts() {
    return httpClient<AdminProduct[]>(`${env.apiBaseUrl}/admin/products`)
  },
}
