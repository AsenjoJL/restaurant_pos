import { calculateOrderTotals } from '../../../shared/lib/orders'
import type { Order } from '../../../shared/types/order'
import { ordersSeed } from '../../../mock/seed'
import type { OrdersRepository } from './orders.repository'
import type { CapturePaymentInput, CreateOrderInput, UpdateOrderInput } from '../types/contracts'

let ordersState: Order[] = structuredClone(ordersSeed)

const findOrder = (id: string) => ordersState.find((order) => order.id === id)

export const ordersRepositoryMock: OrdersRepository = {
  async list() {
    return structuredClone(ordersState)
  },
  async getById(id) {
    const target = findOrder(id)
    return target ? structuredClone(target) : null
  },
  async create(payload: CreateOrderInput) {
    const now = new Date().toISOString()
    const totals = calculateOrderTotals(payload.items)
    const next: Order = {
      id: crypto.randomUUID(),
      order_no: `M-${Math.floor(Math.random() * 9000) + 1000}`,
      source: payload.source,
      status: 'PENDING_PAYMENT',
      order_type: payload.orderType,
      table: payload.table,
      items: payload.items,
      note: payload.note,
      subtotal: totals.subtotal,
      tax: totals.tax,
      total: totals.total,
      placed_at: now,
      audit_log: [],
    }
    ordersState = [next, ...ordersState]
    return structuredClone(next)
  },
  async update(id: string, payload: UpdateOrderInput) {
    const target = findOrder(id)
    if (!target) {
      throw new Error('Order not found')
    }
    Object.assign(target, payload)
    return structuredClone(target)
  },
  async capturePayment(id: string, payload: CapturePaymentInput) {
    const target = findOrder(id)
    if (!target) {
      throw new Error('Order not found')
    }
    target.payment_method = payload.method
    target.payment_amount = payload.amount
    target.payment_reference = payload.reference
    target.payment_payer = payload.payer
    target.status = 'PAID'
    target.audit_log.unshift({
      id: crypto.randomUUID(),
      action: 'PAYMENT',
      note: `Payment captured via ${payload.method}.`,
      at: new Date().toISOString(),
    })
    return structuredClone(target)
  },
  async cancel(id: string, reason: string) {
    const target = findOrder(id)
    if (!target) {
      throw new Error('Order not found')
    }
    target.status = 'CANCELLED'
    target.audit_log.unshift({
      id: crypto.randomUUID(),
      action: 'CANCEL',
      note: reason,
      at: new Date().toISOString(),
    })
    return structuredClone(target)
  },
}

