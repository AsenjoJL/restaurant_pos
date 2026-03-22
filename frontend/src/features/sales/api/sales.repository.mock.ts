import { ingredientsSeed, ordersSeed, recipesSeed } from '../../../mock/seed'
import { isPaymentCaptured } from '../../../shared/lib/orders'
import type { SalesRecord } from '../../../shared/types/sales'
import { calculateOrderCost } from '../../inventory/inventory.logic'
import type { SalesRepository, UpsertSalesRecordInput } from './sales.repository'

const recordsState: SalesRecord[] = ordersSeed
  .filter((order) => isPaymentCaptured(order))
  .map((order) => {
    const cogs = calculateOrderCost(order, recipesSeed, ingredientsSeed)
    const grossProfit = order.total - cogs
    const grossMargin = order.total > 0 ? grossProfit / order.total : 0
    return {
      id: crypto.randomUUID(),
      orderId: order.id,
      orderNo: order.order_no,
      source: order.source,
      orderType: order.order_type,
      items: order.items,
      subtotal: order.subtotal,
      discount: order.discount ?? 0,
      serviceCharge: order.service_charge ?? 0,
      tax: order.tax,
      total: order.total,
      cogs,
      grossProfit,
      grossMargin,
      paymentMethod: order.payment_method ?? 'CASH',
      paymentAmount: order.payment_amount ?? order.total,
      paymentChange: order.payment_change,
      paymentReference: order.payment_reference,
      paymentPayer: order.payment_payer,
      processedBy: order.processed_by,
      placedAt: order.placed_at,
      paidAt: order.kitchen_sent_at ?? order.placed_at,
    }
  })

const buildSummary = () => {
  const grossSales = recordsState.reduce((sum, item) => sum + item.total, 0)
  const tax = recordsState.reduce((sum, item) => sum + item.tax, 0)
  const cogs = recordsState.reduce((sum, item) => sum + (item.cogs ?? 0), 0)
  const grossProfit = grossSales - cogs
  const grossMargin = grossSales > 0 ? grossProfit / grossSales : 0

  return {
    grossSales,
    tax,
    netSales: grossSales - tax,
    cogs,
    grossProfit,
    grossMargin,
  }
}

const buildRecord = (payload: UpsertSalesRecordInput): SalesRecord => ({
  ...payload,
  id: payload.id ?? crypto.randomUUID(),
})

const upsert = (payload: UpsertSalesRecordInput): SalesRecord => {
  const existingIndex = recordsState.findIndex((item) => item.orderId === payload.orderId)
  const nextRecord = buildRecord(payload)

  if (existingIndex >= 0) {
    const currentId = recordsState[existingIndex].id
    const merged = {
      ...recordsState[existingIndex],
      ...nextRecord,
      id: nextRecord.id ?? currentId,
    }
    recordsState[existingIndex] = merged
    return structuredClone(merged)
  }

  recordsState.unshift(nextRecord)
  return structuredClone(nextRecord)
}

export const salesRepositoryMock: SalesRepository = {
  async getSnapshot() {
    return {
      records: structuredClone(recordsState),
      summary: buildSummary(),
    }
  },
  async listRecords() {
    return structuredClone(recordsState)
  },
  async getSummary() {
    return buildSummary()
  },
  async createRecord(payload) {
    return upsert(payload)
  },
  async upsertRecord(payload) {
    return upsert(payload)
  },
}
