import { createContext } from 'react'
import type { OrderType } from '../pos/pos.types'
import { kioskReducer } from './kiosk.reducer'
import type {
  AddItemPayload,
  KioskAction,
  KioskContextValue,
  KioskState,
} from './kiosk.types'
import {
  buildKioskOrder,
  calculateKioskTotals,
  generateOrderNumber,
  type KioskCartItem,
  type KioskTotals,
} from './kiosk.utils'

export type {
  AddItemPayload,
  KioskAction,
  KioskContextValue,
  KioskState,
}

export const initialKioskState: KioskState = {
  orderType: null,
  tableLabel: '',
  cart: [],
  note: '',
  orderNumber: null,
  placedAt: null,
  ordersByNo: {},
}

export const KioskContext = createContext<KioskContextValue | undefined>(undefined)

export { kioskReducer }

export const computeKioskTotals = (cart: KioskCartItem[]) => calculateKioskTotals(cart)

export const makeKioskOrder = (params: {
  orderNo: string
  orderType: OrderType
  tableLabel: string
  cart: KioskCartItem[]
  note: string
  totals: KioskTotals
  placedAt: string
}) => buildKioskOrder(params)

export const newOrderNumber = () => generateOrderNumber()
