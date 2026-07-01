import { fetchAllLaravelCollection, fetchLaravelItem } from '../../../shared/api/laravel'
import type { Order, ReplacementTicket } from '../../../shared/types/order'
import type { KitchenRepository } from './kitchen.repository'
import type { KitchenQueueSnapshot, KitchenStatusUpdateInput } from '../types/contracts'

const kitchenStatuses = ['SENT_TO_KITCHEN', 'PREPARING', 'READY_FOR_PICKUP', 'COMPLETED']
const KITCHEN_ORDERS_PAGE_SIZE = 250
const KITCHEN_ORDERS_ENDPOINT = `/api/v1/orders?per_page=${KITCHEN_ORDERS_PAGE_SIZE}`

export const kitchenRepositoryHttp: KitchenRepository = {
  async getQueue(): Promise<KitchenQueueSnapshot> {
    const orders = await fetchAllLaravelCollection<Order>(KITCHEN_ORDERS_ENDPOINT)

    return {
      orders: orders.filter((order) => kitchenStatuses.includes(order.status)),
      replacementTickets: [],
    }
  },
  async updateOrderStatus(orderId: string, payload: KitchenStatusUpdateInput): Promise<Order> {
    return fetchLaravelItem<Order>(`/api/v1/orders/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify({ status: payload.status }),
    })
  },
  async updateReplacementStatus(
    ticketId: string,
    payload: { status: ReplacementTicket['status'] },
  ): Promise<ReplacementTicket> {
    return {
      id: ticketId,
      orderId: 'unknown',
      orderNo: ticketId,
      items: [],
      status: payload.status,
      createdAt: new Date().toISOString(),
    }
  },
}
