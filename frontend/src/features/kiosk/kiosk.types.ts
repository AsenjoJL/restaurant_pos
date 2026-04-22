import type { Order } from '../../shared/types/order'
import type { MenuProduct, OrderType } from '../pos/pos.types'
import type { KioskCartItem, KioskTotals } from './kiosk.utils'

export type KioskState = {
  orderType: OrderType | null
  tableLabel: string
  cart: KioskCartItem[]
  note: string
  orderNumber: string | null
  placedAt: string | null
  ordersByNo: Record<string, Order>
}

export type AddItemPayload = {
  product: MenuProduct
  quantity: number
  modifiers: string[]
}

export type KioskAction =
  | { type: 'SET_ORDER_TYPE'; payload: OrderType }
  | { type: 'SET_TABLE'; payload: string }
  | { type: 'ADD_ITEM'; payload: AddItemPayload }
  | { type: 'UPDATE_QTY'; payload: { key: string; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'SET_NOTE'; payload: string }
  | { type: 'CLEAR_CART' }
  | { type: 'PLACE_ORDER'; payload: { orderNumber: string; placedAt: string; order: Order } }
  | { type: 'RESET' }

export type KioskContextValue = {
  state: KioskState
  totals: KioskTotals
  setOrderType: (orderType: OrderType) => void
  setTable: (value: string) => void
  addItem: (payload: AddItemPayload) => void
  updateQuantity: (key: string, quantity: number) => void
  removeItem: (key: string) => void
  setNote: (value: string) => void
  clearCart: () => void
  placeOrder: () => { orderNumber: string; order: Order } | null
  reset: () => void
}
