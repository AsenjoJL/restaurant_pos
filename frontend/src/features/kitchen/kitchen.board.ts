import { formatEnumLabel } from '../../shared/lib/orders'
import type { Order } from '../../shared/types/order'
import { formatDuration, getOrderElapsed } from './kitchen.logic'
import { getKitchenStationLabel, resolveKitchenStation } from './kitchen.utils'

export function getKitchenBoardStatusLabel(status: string) {
  if (status === 'SENT_TO_KITCHEN') {
    return 'Pending'
  }
  if (status === 'PREPARING') {
    return 'Preparing'
  }
  return 'Ready'
}

export function getKitchenBoardStations(order: Order) {
  return Array.from(new Set(order.items.map((item) => resolveKitchenStation(item.id))))
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

export function getKitchenBoardStationAriaLabel(station: ReturnType<typeof resolveKitchenStation>) {
  return getKitchenStationLabel(station)
}
