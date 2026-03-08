import type { Order } from '../../types/order'

export const formatPlacedAt = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return date.toLocaleString()
}

export const formatDate = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return date.toLocaleDateString()
}

export const formatTime = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return date.toLocaleTimeString()
}

export const formatTaxRate = (order: Order) => {
  const discount = order.discount ?? 0
  const service = order.service_charge ?? 0
  const taxable = Math.max(order.subtotal - discount + service, 0)
  if (taxable <= 0 || order.tax <= 0) {
    return null
  }
  const rate = (order.tax / taxable) * 100
  return `${rate.toFixed(2)}%`
}
