import type { SalesRecord } from '../../../shared/types/sales'

export type SalesSummary = {
  grossSales: number
  tax: number
  netSales: number
  cogs: number
  grossProfit: number
  grossMargin: number
}

export type SalesSnapshot = {
  records: SalesRecord[]
  summary: SalesSummary
}

