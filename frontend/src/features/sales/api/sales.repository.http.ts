import { env } from '../../../app/config/env'
import { httpClient } from '../../../shared/api/http'
import type { SalesRecord } from '../../../shared/types/sales'
import type { SalesRepository, UpsertSalesRecordInput } from './sales.repository'
import type { SalesSnapshot, SalesSummary } from '../types/contracts'

export const salesRepositoryHttp: SalesRepository = {
  async getSnapshot() {
    return httpClient<SalesSnapshot>(`${env.apiBaseUrl}/sales/snapshot`)
  },
  async listRecords() {
    return httpClient<SalesRecord[]>(`${env.apiBaseUrl}/sales/records`)
  },
  async getSummary() {
    return httpClient<SalesSummary>(`${env.apiBaseUrl}/sales/summary`)
  },
  async createRecord(payload: UpsertSalesRecordInput) {
    return httpClient<SalesRecord>(`${env.apiBaseUrl}/sales/records`, {
      method: 'POST',
      body: payload,
    })
  },
  async upsertRecord(payload: UpsertSalesRecordInput) {
    return httpClient<SalesRecord>(`${env.apiBaseUrl}/sales/records/upsert`, {
      method: 'POST',
      body: payload,
    })
  },
}
