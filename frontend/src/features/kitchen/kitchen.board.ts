import { formatEnumLabel } from '../../shared/lib/orders'
import type { Order } from '../../shared/types/order'
import { formatDuration, getOrderElapsed } from './kitchen.logic'

export function getKitchenBoardStatusLabel(status: string) {
  if (status === 'SENT_TO_KITCHEN') {
    return 'Pending'
  }
  if (status === 'PREPARING') {
    return 'Preparing'
  }
  return 'Ready'
}

export function getKitchenBoardItemCount(order: Order) {
  return order.items.reduce((sum, item) => sum + item.quantity, 0)
}

export function getKitchenBoardOrderTypeLabel(order: Order) {
  return formatEnumLabel(order.order_type)
}

export function getKitchenBoardWaitLabel(order: Order) {
  const elapsed = getOrderElapsed(order)
  return {
    ...elapsed,
    durationLabel: formatDuration(elapsed.elapsedMs),
  }
}
