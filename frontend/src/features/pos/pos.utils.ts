import type { CartItem, DraftOrder, MenuProduct } from './pos.types'
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

export const generateStaffOrderNumber = () => {
  const number = Math.floor(100 + Math.random() * 9900)
  return `S-${number}`
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
    items: mapDraftItemsToOrderItems(draft.items),
    note: draft.notes.trim().length > 0 ? draft.notes.trim() : undefined,
    subtotal: totals.subtotal,
    discount: totals.discount,
    service_charge: totals.service,
    tax: totals.tax,
    total: totals.total,
    placed_at: placedAt,
    audit_log: [],
  }
}

export const mapDraftItemsToOrderItems = (items: CartItem[]) =>
  items.map((item) => ({
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
  }))

const buildSelectedModifiersFromNames = (product: MenuProduct, names: string[]) => {
  if (!product.modifierGroups || product.modifierGroups.length === 0) {
    return []
  }
  const result = []
  for (const name of names) {
    const group = product.modifierGroups.find((grp) =>
      grp.options.some((option) => option.name === name),
    )
    const option = group?.options.find((opt) => opt.name === name)
    if (group && option) {
      result.push({
        groupId: group.id,
        groupName: group.name,
        optionId: option.id,
        name: option.name,
        priceDelta: option.priceDelta,
      })
    }
  }
  return result
}

export const buildDraftFromOrder = (
  order: Order,
  products: MenuProduct[],
  tableId: string | null,
): DraftOrder => {
  return {
    id: order.order_no,
    orderType: order.order_type === 'DINE_IN' ? 'dine-in' : 'takeout',
    tableId,
    staffId: order.processed_by?.id ?? null,
    notes: order.note ?? '',
    items: order.items.map((item) => {
      const product =
        products.find((productItem) => productItem.id === item.id) ??
        ({
          id: item.id,
          name: item.name,
          description: '',
          price: item.price,
          categoryId: 'unknown',
          tone: 'sun',
        } as MenuProduct)
      return {
        product,
        quantity: item.quantity,
        note: item.note,
        selectedModifiers: buildSelectedModifiersFromNames(product, item.modifiers ?? []),
        finalUnitPrice: item.price,
        bundleSelections: item.bundle_items?.map((bundleItem) => ({
          groupId: 'bundle',
          groupLabel: 'Bundle',
          productId: bundleItem.id,
          name: bundleItem.name,
          price: bundleItem.price,
          quantity: bundleItem.quantity,
        })),
      }
    }),
    discount: order.discount ?? 0,
    promoCode: null,
    serviceCharge: order.service_charge ?? 0,
    taxRate: 0.0825,
    status: 'draft',
  }
}
