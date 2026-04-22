import { formatEnumLabel } from '../../shared/lib/orders'
import type { Order } from '../../shared/types/order'

export function getCashierOrderTypeLabel(order: Order): string {
  return order.order_type === 'DINE_IN'
    ? order.table ?? 'Dine-in'
    : formatEnumLabel(order.order_type)
}

export function getCashierOrderMetaLabel(order: Order): string {
  return order.order_type === 'DINE_IN'
    ? `Dine-in • ${order.table ?? 'No table'}`
    : formatEnumLabel(order.order_type)
}
