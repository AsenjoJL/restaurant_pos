import type { Order, ReplacementTicket } from '../../../shared/types/order'

export type KitchenQueueSnapshot = {
  orders: Order[]
  replacementTickets: ReplacementTicket[]
}

export type KitchenStatusUpdateInput = {
  status: 'PREPARING' | 'READY_FOR_PICKUP' | 'COMPLETED'
}

