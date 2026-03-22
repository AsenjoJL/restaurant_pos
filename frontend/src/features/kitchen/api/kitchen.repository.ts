import type { RepositoryResult } from '../../../shared/api/contracts'
import type { Order, ReplacementTicket } from '../../../shared/types/order'
import type { KitchenQueueSnapshot, KitchenStatusUpdateInput } from '../types/contracts'

export interface KitchenRepository {
  getQueue(): RepositoryResult<KitchenQueueSnapshot>
  updateOrderStatus(orderId: string, payload: KitchenStatusUpdateInput): RepositoryResult<Order>
  updateReplacementStatus(
    ticketId: string,
    payload: { status: ReplacementTicket['status'] },
  ): RepositoryResult<ReplacementTicket>
}

