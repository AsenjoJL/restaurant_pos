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
      throw new Error('Order not found')
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
      throw new Error('Replacement ticket not found')
    }
    target.status = payload.status
    return structuredClone(target)
  },
}
