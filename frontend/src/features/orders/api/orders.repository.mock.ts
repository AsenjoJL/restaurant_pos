import { calculateOrderTotals } from '../../../shared/lib/orders'
import type { Order } from '../../../shared/types/order'
import { ordersSeed } from '../../../mock/seed'
import type { OrdersRepository } from './orders.repository'
import type {
  CapturePaymentInput,
  CreateOrderInput,
  UpdateOrderInput,
  VoidOrderInput,
} from '../types/contracts'

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
    const now = payload.placedAt ?? new Date().toISOString()
    const computedTotals = calculateOrderTotals(payload.items)
    const id = payload.id ?? crypto.randomUUID()
    const orderNo = payload.orderNo ?? `M-${Math.floor(Math.random() * 9000) + 1000}`

    const existing = findOrder(id)
    if (existing) {
      Object.assign(existing, {
        order_no: orderNo,
        source: payload.source,
        order_type: payload.orderType,
        table: payload.table,
        items: payload.items,
        note: payload.note,
        subtotal: payload.subtotal ?? computedTotals.subtotal,
        discount: payload.discount,
        service_charge: payload.serviceCharge,
        tax: payload.tax ?? computedTotals.tax,
        total: payload.total ?? computedTotals.total,
        placed_at: now,
      } satisfies Partial<Order>)
      return structuredClone(existing)
    }

    const next: Order = {
      id,
      order_no: orderNo,
      source: payload.source,
      status: 'PENDING_PAYMENT',
      order_type: payload.orderType,
      table: payload.table,
      items: payload.items,
      note: payload.note,
      subtotal: payload.subtotal ?? computedTotals.subtotal,
      discount: payload.discount,
      service_charge: payload.serviceCharge,
      tax: payload.tax ?? computedTotals.tax,
      total: payload.total ?? computedTotals.total,
      placed_at: now,
      audit_log: [],
    }
    ordersState = [next, ...ordersState]
    return structuredClone(next)
  },
  async update(id: string, payload: UpdateOrderInput) {
    const target = findOrder(id)
    if (!target) {
      // In mock/offline mode, we do best-effort instead of failing sync calls.
      const items = payload.items ?? []
      const totals = calculateOrderTotals(items)
      const next: Order = {
        id,
        order_no: id,
        source: 'STAFF',
        status: payload.status ?? 'PENDING_PAYMENT',
        order_type: 'TAKEOUT',
        table: payload.table ?? null,
        items,
        note: payload.note,
        subtotal: payload.subtotal ?? totals.subtotal,
        discount: payload.discount,
        service_charge: payload.service_charge,
        tax: payload.tax ?? totals.tax,
        total: payload.total ?? totals.total,
        placed_at: new Date().toISOString(),
        audit_log: [],
      }
      ordersState = [next, ...ordersState]
      return structuredClone(next)
    }
    Object.assign(target, payload)
    return structuredClone(target)
  },
  async capturePayment(id: string, payload: CapturePaymentInput) {
    const target = findOrder(id)
    if (!target) {
      // Best-effort: if repository state is missing, don't hard-fail the caller.
      return structuredClone({
        id,
        order_no: id,
        source: 'STAFF',
        status: 'PAID',
        order_type: 'TAKEOUT',
        table: null,
        items: [],
        subtotal: 0,
        tax: 0,
        total: payload.amount,
        payment_method: payload.method,
        payment_amount: payload.amount,
        payment_reference: payload.reference,
        payment_payer: payload.payer,
        placed_at: new Date().toISOString(),
        audit_log: [],
      } satisfies Order)
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
      return structuredClone({
        id,
        order_no: id,
        source: 'STAFF',
        status: 'CANCELLED',
        order_type: 'TAKEOUT',
        table: null,
        items: [],
        subtotal: 0,
        tax: 0,
        total: 0,
        placed_at: new Date().toISOString(),
        audit_log: [],
      } satisfies Order)
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
  async void(id: string, payload: VoidOrderInput) {
    const target = findOrder(id)
    if (!target) {
      return structuredClone({
        id,
        order_no: id,
        source: 'STAFF',
        status: 'COMPLETED',
        order_type: 'TAKEOUT',
        table: null,
        items: [],
        subtotal: 0,
        tax: 0,
        total: 0,
        placed_at: new Date().toISOString(),
        audit_log: [
          {
            id: crypto.randomUUID(),
            action: 'VOID',
            note: payload.reason,
            at: new Date().toISOString(),
          },
        ],
      } satisfies Order)
    }
    target.audit_log.unshift({
      id: crypto.randomUUID(),
      action: 'VOID',
      note: payload.reason,
      at: new Date().toISOString(),
    })
    return structuredClone(target)
  },
}

