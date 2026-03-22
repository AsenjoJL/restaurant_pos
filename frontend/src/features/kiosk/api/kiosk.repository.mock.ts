import { calculateOrderTotals } from '../../../shared/lib/orders'
import type { Order } from '../../../shared/types/order'
import { categoriesSeed, productsSeed } from '../../../mock/seed'
import type { KioskRepository } from './kiosk.repository'
import type { PlaceKioskOrderInput } from '../types/contracts'

export const kioskRepositoryMock: KioskRepository = {
  async getMenuSnapshot() {
    return {
      categories: structuredClone(categoriesSeed),
      products: structuredClone(productsSeed),
    }
  },
  async placeOrder(payload: PlaceKioskOrderInput) {
    const totals = calculateOrderTotals(payload.items)
    const next: Order = {
      id: crypto.randomUUID(),
      order_no: `K-${Math.floor(Math.random() * 9000) + 1000}`,
      source: 'KIOSK',
      status: 'PENDING_PAYMENT',
      order_type: payload.orderType,
      table: payload.table,
      items: payload.items,
      note: payload.note,
      subtotal: totals.subtotal,
      tax: totals.tax,
      total: totals.total,
      placed_at: new Date().toISOString(),
      audit_log: [],
    }
    return next
  },
}

