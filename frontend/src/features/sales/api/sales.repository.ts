import type { RepositoryResult } from '../../../shared/api/contracts'
import type { SalesRecord } from '../../../shared/types/sales'
import type { SalesSnapshot, SalesSummary } from '../types/contracts'

export type UpsertSalesRecordInput = Omit<SalesRecord, 'id'> & {
  id?: string
}

export interface SalesRepository {
  getSnapshot(): RepositoryResult<SalesSnapshot>
  listRecords(): RepositoryResult<SalesRecord[]>
  getSummary(): RepositoryResult<SalesSummary>
  createRecord(payload: UpsertSalesRecordInput): RepositoryResult<SalesRecord>
  upsertRecord(payload: UpsertSalesRecordInput): RepositoryResult<SalesRecord>
}
