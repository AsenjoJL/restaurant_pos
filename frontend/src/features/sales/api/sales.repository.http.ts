import { fetchAllLaravelCollection } from '../../../shared/api/laravel'
import type { SalesRecord } from '../../../shared/types/sales'
import type { SalesRepository, UpsertSalesRecordInput } from './sales.repository'
import type { SalesSnapshot, SalesSummary } from '../types/contracts'

type LaravelOrder = {
  id: string
  order_no: string
  source: SalesRecord['source']
  order_type: SalesRecord['orderType']
  items: SalesRecord['items']
  subtotal: number
  discount?: number
  service_charge?: number
  tax: number
  total: number
  payment_method?: SalesRecord['paymentMethod']
  payment_amount?: number
  payment_change?: number
  payment_reference?: string
  payment_payer?: string
  processed_by?: SalesRecord['processedBy']
  placed_at: string
  paid_at?: string
  status: string
}

const SALES_ORDERS_PAGE_SIZE = 250
const SALES_ORDERS_ENDPOINT = `/api/v1/orders?per_page=${SALES_ORDERS_PAGE_SIZE}`

const toSalesRecord = (order: LaravelOrder): SalesRecord => ({
  id: order.id,
  orderId: order.id,
  orderNo: order.order_no,
  source: order.source,
  orderType: order.order_type,
  items: order.items ?? [],
  subtotal: Number(order.subtotal),
  discount: Number(order.discount ?? 0),
  serviceCharge: Number(order.service_charge ?? 0),
  tax: Number(order.tax),
  total: Number(order.total),
  paymentMethod: order.payment_method ?? 'CASH',
  paymentAmount: Number(order.payment_amount ?? order.total),
  paymentChange: Number(order.payment_change ?? 0),
  paymentReference: order.payment_reference,
  paymentPayer: order.payment_payer,
  processedBy: order.processed_by,
  placedAt: order.placed_at,
  paidAt: order.paid_at ?? order.placed_at,
  cogs: 0,
  grossProfit: Number(order.total),
  grossMargin: Number(order.total) > 0 ? 1 : 0,
})

const summarize = (records: SalesRecord[]): SalesSummary => {
  const grossSales = records.reduce((sum, record) => sum + record.subtotal, 0)
  const tax = records.reduce((sum, record) => sum + record.tax, 0)
  const netSales = records.reduce((sum, record) => sum + record.total, 0)
  const cogs = records.reduce((sum, record) => sum + (record.cogs ?? 0), 0)
  const grossProfit = records.reduce((sum, record) => sum + (record.grossProfit ?? 0), 0)

  return {
    grossSales,
    tax,
    netSales,
    cogs,
    grossProfit,
    grossMargin: netSales > 0 ? grossProfit / netSales : 0,
  }
}

const loadRecords = async () => {
  const orders = await fetchAllLaravelCollection<LaravelOrder>(SALES_ORDERS_ENDPOINT)
  return orders
    .filter((order) => order.status === 'PAID' || order.status === 'COMPLETED')
    .map(toSalesRecord)
}

export const salesRepositoryHttp: SalesRepository = {
  async getSnapshot(): Promise<SalesSnapshot> {
    const records = await loadRecords()
    return {
      records,
      summary: summarize(records),
    }
  },
  listRecords: loadRecords,
  async getSummary() {
    return summarize(await loadRecords())
  },
  async createRecord(payload: UpsertSalesRecordInput) {
    return {
      ...payload,
      id: payload.id ?? crypto.randomUUID(),
    }
  },
  async upsertRecord(payload: UpsertSalesRecordInput) {
    return {
      ...payload,
      id: payload.id ?? crypto.randomUUID(),
    }
  },
}
