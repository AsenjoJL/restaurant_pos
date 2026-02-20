import type { CartItem, DraftOrder } from './pos.types'
import type { Order } from '../../shared/types/order'
import { MAX_NOTE_LENGTH, limitLength, sanitizeText } from '../../shared/lib/validators'

export type Totals = {
  subtotal: number
  discount: number
  service: number
  tax: number
  total: number
  itemCount: number
}

export const calculateTotals = (
  items: CartItem[],
  discount: number,
  serviceCharge: number,
  taxRate: number,
): Totals => {
  const subtotal = items.reduce((sum, item) => {
    const unitPrice = item.finalUnitPrice ?? item.product.price
    return sum + unitPrice * item.quantity
  }, 0)

  const discountAmount = Math.min(discount, subtotal)
  const service = serviceCharge
  const taxableAmount = Math.max(subtotal - discountAmount + service, 0)
  const tax = taxableAmount * taxRate
  const total = taxableAmount + tax
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return {
    subtotal,
    discount: discountAmount,
    service,
    tax,
    total,
    itemCount,
  }
}

export const sanitizeNote = (value: string) =>
  limitLength(sanitizeText(value), MAX_NOTE_LENGTH)

const ORDER_PREFIX = 'S'

export const generateStaffOrderNumber = () => {
  const number = Math.floor(100 + Math.random() * 900)
  return `${ORDER_PREFIX}-${number}`
}

export const toSharedOrderType = (orderType: DraftOrder['orderType']): Order['order_type'] => {
  switch (orderType) {
    case 'dine-in':
      return 'DINE_IN'
    case 'takeout':
      return 'TAKEOUT'
    default:
      return 'TAKEOUT'
  }
}

type BuildStaffOrderPayload = {
  orderNo: string
  draft: DraftOrder
  totals: Totals
  tableLabel: string
  placedAt: string
}

export const buildStaffOrder = ({
  orderNo,
  draft,
  totals,
  tableLabel,
  placedAt,
}: BuildStaffOrderPayload): Order => {
  const sharedType = toSharedOrderType(draft.orderType)
  const table =
    sharedType === 'DINE_IN' && tableLabel.trim().length > 0
      ? tableLabel.trim()
      : null

  return {
    id: orderNo,
    order_no: orderNo,
    source: 'STAFF',
    status: 'PENDING_PAYMENT',
    order_type: sharedType,
    table,
    items: draft.items.map((item) => ({
      id: item.product.id,
      name: item.product.name,
      price: item.finalUnitPrice ?? item.product.price,
      quantity: item.quantity,
      modifiers: item.selectedModifiers.map((mod) => mod.name),
      note: item.note,
      bundle_items: item.bundleSelections?.map((selection) => ({
        id: selection.productId,
        name: selection.name,
        price: selection.price,
        quantity: selection.quantity,
      })),
    })),
    note: draft.notes.trim().length > 0 ? draft.notes.trim() : undefined,
    subtotal: totals.subtotal,
    tax: totals.tax,
    total: totals.total,
    placed_at: placedAt,
    audit_log: [],
  }
}
