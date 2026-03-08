import { createSlice, nanoid } from '@reduxjs/toolkit'
import { ingredients, orders as initialOrders, recipes } from '../../mock/data'
import { isPaymentCaptured } from '../../shared/lib/orders'
import type { Order } from '../../shared/types/order'
import type { SalesRecord } from '../../shared/types/sales'
import { ORDERS_STORAGE_KEY } from '../orders/orders.store'
import { calculateOrderCost } from '../inventory/inventory.logic'

export const SALES_STORAGE_KEY = 'pos.sales.v1'

type SalesState = {
  records: SalesRecord[]
}

type AddSalesRecordPayload = Omit<SalesRecord, 'id' | 'paidAt'> & {
  id?: string
  paidAt?: string
}

const buildOrderForCost = (record: SalesRecord): Order => ({
  id: record.orderId,
  order_no: record.orderNo,
  source: record.source,
  status: 'PAID',
  order_type: record.orderType,
  table: null,
  items: record.items,
  note: undefined,
  subtotal: record.subtotal,
  discount: record.discount ?? 0,
  service_charge: record.serviceCharge ?? 0,
  tax: record.tax,
  total: record.total,
  placed_at: record.placedAt,
  audit_log: [],
})

const fillCostFields = (record: SalesRecord): SalesRecord => {
  const cogs = record.cogs ?? calculateOrderCost(buildOrderForCost(record), recipes, ingredients)
  const grossProfit = record.grossProfit ?? record.total - cogs
  const grossMargin =
    record.grossMargin ?? (record.total > 0 ? grossProfit / record.total : 0)
  return {
    ...record,
    cogs,
    grossProfit,
    grossMargin,
  }
}

const migrateSalesRecords = (records: SalesRecord[]) => {
  let changed = false
  const migrated = records.map((record) => {
    if (
      record.cogs !== undefined &&
      record.grossProfit !== undefined &&
      record.grossMargin !== undefined
    ) {
      return record
    }
    changed = true
    return fillCostFields(record)
  })
  return { migrated, changed }
}

const loadStoredSales = () => {
  if (typeof window === 'undefined') {
    return null
  }
  try {
    const raw = localStorage.getItem(SALES_STORAGE_KEY)
    if (!raw) {
      return null
    }
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return null
    }
    const { migrated } = migrateSalesRecords(parsed as SalesRecord[])
    return migrated
  } catch {
    return null
  }
}

const loadStoredOrders = () => {
  if (typeof window === 'undefined') {
    return null
  }
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY)
    if (!raw) {
      return null
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as Order[]) : null
  } catch {
    return null
  }
}

const buildSalesRecordFromOrder = (order: Order): SalesRecord | null => {
  if (!isPaymentCaptured(order)) {
    return null
  }
  const paidAt =
    order.kitchen_sent_at ??
    order.kitchen_started_at ??
    order.kitchen_ready_at ??
    new Date().toISOString()
  const cogs = calculateOrderCost(order, recipes, ingredients)
  const grossProfit = order.total - cogs
  const grossMargin = order.total > 0 ? grossProfit / order.total : 0
  return {
    id: nanoid(),
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
    paidAt,
  }
}

const seedOrders = loadStoredOrders() ?? initialOrders
const seededRecords =
  loadStoredSales() ??
  seedOrders
    .map((order) => buildSalesRecordFromOrder(order))
    .filter((record): record is SalesRecord => Boolean(record))
    .map((record) => fillCostFields(record))

const initialState: SalesState = {
  records: seededRecords,
}

const salesSlice = createSlice({
  name: 'sales',
  initialState,
  reducers: {
    addSalesRecord: (state, action: { payload: AddSalesRecordPayload }) => {
      const exists = state.records.some(
        (record) => record.orderId === action.payload.orderId,
      )
      if (exists) {
        return
      }
      const paidAt = action.payload.paidAt ?? new Date().toISOString()
      const id = action.payload.id ?? nanoid()
      const record = fillCostFields({
        ...action.payload,
        id,
        paidAt,
      })
      state.records.unshift(record)
    },
    setSalesRecords: (state, action: { payload: SalesRecord[] }) => {
      state.records = action.payload
    },
  },
})

export const { addSalesRecord, setSalesRecords } = salesSlice.actions
export default salesSlice.reducer
