import type { Order, OrderItem, OrderStatus, OrderTotals } from '../types/order'

export const DEFAULT_TAX_RATE = 0.0825

export const calculateOrderTotals = (
  items: OrderItem[],
  taxRate = DEFAULT_TAX_RATE,
): OrderTotals => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * taxRate
  const total = subtotal + tax
  return { subtotal, tax, total }
}

export const getItemCount = (items: OrderItem[]) =>
  items.reduce((sum, item) => {
    if (item.bundle_items && item.bundle_items.length > 0) {
      const bundleCount = item.bundle_items.reduce(
        (bundleSum, bundleItem) => bundleSum + bundleItem.quantity,
        0,
      )
      return sum + bundleCount * item.quantity
    }
    return sum + item.quantity
  }, 0)

export const formatEnumLabel = (value: string) =>
  value
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())

export const isKitchenStatus = (status: OrderStatus) =>
  status === 'SENT_TO_KITCHEN' ||
  status === 'PREPARING' ||
  status === 'READY_FOR_PICKUP' ||
  status === 'COMPLETED'

export const isPaymentCaptured = (order: Order) =>
  order.audit_log.some((entry) => entry.action === 'PAYMENT')

export const getKitchenStatusLabel = (status: OrderStatus) => {
  switch (status) {
    case 'SENT_TO_KITCHEN':
      return 'Pending'
    case 'PREPARING':
      return 'Preparing'
    case 'READY_FOR_PICKUP':
      return 'Ready for Pickup'
    case 'COMPLETED':
      return 'Completed'
    default:
      return formatEnumLabel(status)
  }
}
