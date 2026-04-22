import type { Order, ReplacementTicket } from '../../../shared/types/order'
import { ordersSeed } from '../../../mock/seed'
import type { KitchenRepository } from './kitchen.repository'
import type { KitchenStatusUpdateInput } from '../types/contracts'

const kitchenOrdersState: Order[] = structuredClone(ordersSeed)
const replacementTicketsState: ReplacementTicket[] = []

export const kitchenRepositoryMock: KitchenRepository = {
  async getQueue() {
    const orders = kitchenOrdersState.filter((order) =>
      ['SENT_TO_KITCHEN', 'PREPARING', 'READY_FOR_PICKUP', 'COMPLETED'].includes(order.status),
    )
    return {
      orders: structuredClone(orders),
      replacementTickets: structuredClone(replacementTicketsState),
    }
  },
  async updateOrderStatus(orderId: string, payload: KitchenStatusUpdateInput) {
    const target = kitchenOrdersState.find((order) => order.id === orderId)
    if (!target) {
      const next: Order = {
        id: orderId,
        order_no: orderId,
        source: 'STAFF',
        status: payload.status,
        order_type: 'TAKEOUT',
        table: null,
        items: [],
        subtotal: 0,
        tax: 0,
        total: 0,
        placed_at: new Date().toISOString(),
        audit_log: [],
      }
      kitchenOrdersState.unshift(next)
      return structuredClone(next)
    }
    target.status = payload.status
    return structuredClone(target)
  },
  async updateReplacementStatus(
    ticketId: string,
    payload: { status: ReplacementTicket['status'] },
  ) {
    const target = replacementTicketsState.find((ticket) => ticket.id === ticketId)
    if (!target) {
      const next: ReplacementTicket = {
        id: ticketId,
        orderId: 'unknown',
        orderNo: ticketId,
        items: [],
        status: payload.status,
        createdAt: new Date().toISOString(),
      }
      replacementTicketsState.unshift(next)
      return structuredClone(next)
    }
    target.status = payload.status
    return structuredClone(target)
  },
}
