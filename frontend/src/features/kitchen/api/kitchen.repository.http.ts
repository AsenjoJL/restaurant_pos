import { env } from '../../../app/config/env'
import { httpClient } from '../../../shared/api/http'
import type { Order, ReplacementTicket } from '../../../shared/types/order'
import type { KitchenRepository } from './kitchen.repository'
import type { KitchenQueueSnapshot, KitchenStatusUpdateInput } from '../types/contracts'

export const kitchenRepositoryHttp: KitchenRepository = {
  async getQueue() {
    return httpClient<KitchenQueueSnapshot>(`${env.apiBaseUrl}/kitchen/queue`)
  },
  async updateOrderStatus(orderId: string, payload: KitchenStatusUpdateInput) {
    return httpClient<Order>(`${env.apiBaseUrl}/kitchen/orders/${orderId}/status`, {
      method: 'PATCH',
      body: payload,
    })
  },
  async updateReplacementStatus(
    ticketId: string,
    payload: { status: ReplacementTicket['status'] },
  ) {
    return httpClient<ReplacementTicket>(
      `${env.apiBaseUrl}/kitchen/replacements/${ticketId}/status`,
      {
        method: 'PATCH',
        body: payload,
      },
    )
  },
}

