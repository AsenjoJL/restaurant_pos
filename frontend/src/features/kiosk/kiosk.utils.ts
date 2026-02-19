import type { MenuProduct, OrderType } from '../pos/pos.types'
import type { Order } from '../../shared/types/order'

export type KioskCartItem = {
  key: string
  product: MenuProduct
  quantity: number
  modifiers: string[]
}

export type KioskTotals = {
  subtotal: number
  tax: number
  total: number
  itemCount: number
}

export const KIOSK_TAX_RATE = 0.0825

export const calculateKioskTotals = (
  items: KioskCartItem[],
  taxRate = KIOSK_TAX_RATE,
): KioskTotals => {
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  )
  const tax = subtotal * taxRate
  const total = subtotal + tax
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return {
    subtotal,
    tax,
    total,
    itemCount,
  }
}

const ORDER_PREFIX = 'A'

export const generateOrderNumber = () => {
  const number = Math.floor(100 + Math.random() * 900)
  return `${ORDER_PREFIX}-${number}`
}

export const toSharedOrderType = (orderType: OrderType): Order['order_type'] => {
  switch (orderType) {
    case 'dine-in':
      return 'DINE_IN'
    case 'takeout':
      return 'TAKEOUT'
    default:
      return 'TAKEOUT'
  }
}

type BuildKioskOrderPayload = {
  orderNo: string
  orderType: OrderType
  tableLabel: string
  cart: KioskCartItem[]
  note: string
  totals: KioskTotals
  placedAt: string
}

export const buildKioskOrder = ({
  orderNo,
  orderType,
  tableLabel,
  cart,
  note,
  totals,
  placedAt,
}: BuildKioskOrderPayload): Order => ({
  id: orderNo,
  order_no: orderNo,
  source: 'KIOSK',
  status: 'PENDING_PAYMENT',
  order_type: toSharedOrderType(orderType),
  table: tableLabel.trim() ? tableLabel.trim() : null,
  items: cart.map((item) => ({
    id: item.product.id,
    name: item.product.name,
    price: item.product.price,
    quantity: item.quantity,
    modifiers: item.modifiers,
  })),
  note: note.trim() ? note.trim() : undefined,
  subtotal: totals.subtotal,
  tax: totals.tax,
  total: totals.total,
  placed_at: placedAt,
  audit_log: [],
})
