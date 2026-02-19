import type { ReactNode } from 'react'
import { createContext, useContext, useMemo, useReducer } from 'react'
import type { MenuProduct, OrderType } from '../pos/pos.types'
import type { Order } from '../../shared/types/order'
import { MAX_NOTE_LENGTH, limitLength, sanitizeText } from '../../shared/lib/validators'
import {
  buildKioskOrder,
  calculateKioskTotals,
  generateOrderNumber,
  type KioskCartItem,
  type KioskTotals,
} from './kiosk.utils'

type KioskState = {
  orderType: OrderType | null
  tableLabel: string
  cart: KioskCartItem[]
  note: string
  orderNumber: string | null
  placedAt: string | null
  ordersByNo: Record<string, Order>
}

type AddItemPayload = {
  product: MenuProduct
  quantity: number
  modifiers: string[]
}

type KioskAction =
  | { type: 'SET_ORDER_TYPE'; payload: OrderType }
  | { type: 'SET_TABLE'; payload: string }
  | { type: 'ADD_ITEM'; payload: AddItemPayload }
  | { type: 'UPDATE_QTY'; payload: { key: string; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'SET_NOTE'; payload: string }
  | { type: 'CLEAR_CART' }
  | { type: 'PLACE_ORDER'; payload: { orderNumber: string; placedAt: string; order: Order } }
  | { type: 'RESET' }

type KioskContextValue = {
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

const initialState: KioskState = {
  orderType: null,
  tableLabel: '',
  cart: [],
  note: '',
  orderNumber: null,
  placedAt: null,
  ordersByNo: {},
}

const KioskContext = createContext<KioskContextValue | undefined>(undefined)

const normalizeModifiers = (modifiers: string[]) =>
  modifiers
    .map((modifier) => modifier.trim())
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b))

const buildKey = (productId: string, modifiers: string[]) =>
  [productId, ...normalizeModifiers(modifiers)].join('|')

const sanitizeNote = (value: string) =>
  limitLength(sanitizeText(value), MAX_NOTE_LENGTH)

const reducer = (state: KioskState, action: KioskAction): KioskState => {
  switch (action.type) {
    case 'SET_ORDER_TYPE':
      return {
        ...state,
        orderType: action.payload,
        tableLabel: action.payload === 'takeout' ? '' : state.tableLabel,
      }
    case 'SET_TABLE':
      return {
        ...state,
        tableLabel: action.payload,
      }
    case 'ADD_ITEM': {
      const key = buildKey(action.payload.product.id, action.payload.modifiers)
      const existingIndex = state.cart.findIndex((item) => item.key === key)
      if (existingIndex >= 0) {
        const updated = [...state.cart]
        const existing = updated[existingIndex]
        updated[existingIndex] = {
          ...existing,
          quantity: existing.quantity + action.payload.quantity,
        }
        return {
          ...state,
          cart: updated,
        }
      }
      return {
        ...state,
        cart: [
          ...state.cart,
          {
            key,
            product: action.payload.product,
            quantity: action.payload.quantity,
            modifiers: normalizeModifiers(action.payload.modifiers),
          },
        ],
      }
    }
    case 'UPDATE_QTY': {
      const updated = state.cart
        .map((item) =>
          item.key === action.payload.key
            ? { ...item, quantity: action.payload.quantity }
            : item,
        )
        .filter((item) => item.quantity > 0)
      return {
        ...state,
        cart: updated,
      }
    }
    case 'REMOVE_ITEM':
      return {
        ...state,
        cart: state.cart.filter((item) => item.key !== action.payload),
      }
    case 'SET_NOTE':
      return {
        ...state,
        note: sanitizeNote(action.payload),
      }
    case 'CLEAR_CART':
      return {
        ...state,
        cart: [],
      }
    case 'PLACE_ORDER':
      return {
        ...state,
        orderNumber: action.payload.orderNumber,
        placedAt: action.payload.placedAt,
        ordersByNo: {
          ...state.ordersByNo,
          [action.payload.orderNumber]: action.payload.order,
        },
      }
    case 'RESET':
      return {
        ...initialState,
        ordersByNo: state.ordersByNo,
      }
    default:
      return state
  }
}

export const KioskProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  const totals = useMemo(() => calculateKioskTotals(state.cart), [state.cart])

  const placeOrder = () => {
    if (!state.orderType || state.cart.length === 0) {
      return null
    }
    const orderNumber = generateOrderNumber()
    const placedAt = new Date().toISOString()
    const order = buildKioskOrder({
      orderNo: orderNumber,
      orderType: state.orderType,
      tableLabel: state.tableLabel,
      cart: state.cart,
      note: state.note,
      totals,
      placedAt,
    })
    dispatch({
      type: 'PLACE_ORDER',
      payload: {
        orderNumber,
        placedAt,
        order,
      },
    })
    return { orderNumber, order }
  }

  const value: KioskContextValue = {
    state,
    totals,
    setOrderType: (orderType) => dispatch({ type: 'SET_ORDER_TYPE', payload: orderType }),
    setTable: (value) => dispatch({ type: 'SET_TABLE', payload: value }),
    addItem: (payload) => dispatch({ type: 'ADD_ITEM', payload }),
    updateQuantity: (key, quantity) => dispatch({ type: 'UPDATE_QTY', payload: { key, quantity } }),
    removeItem: (key) => dispatch({ type: 'REMOVE_ITEM', payload: key }),
    setNote: (value) => dispatch({ type: 'SET_NOTE', payload: value }),
    clearCart: () => dispatch({ type: 'CLEAR_CART' }),
    placeOrder,
    reset: () => dispatch({ type: 'RESET' }),
  }

  return <KioskContext.Provider value={value}>{children}</KioskContext.Provider>
}

export const useKiosk = () => {
  const context = useContext(KioskContext)
  if (!context) {
    throw new Error('useKiosk must be used within KioskProvider')
  }
  return context
}
