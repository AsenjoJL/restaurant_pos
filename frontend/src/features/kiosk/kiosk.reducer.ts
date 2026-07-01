import { MAX_NOTE_LENGTH, limitLength, sanitizeText } from '../../shared/lib/validators'
import type { KioskAction, KioskState } from './kiosk.types'

const normalizeModifiers = (modifiers: string[]) =>
  modifiers
    .map((modifier) => modifier.trim())
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b))

const buildCartItemKey = (productId: string, modifiers: string[]) =>
  [productId, ...normalizeModifiers(modifiers)].join('|')

const sanitizeNote = (value: string) => limitLength(sanitizeText(value), MAX_NOTE_LENGTH)

export const kioskReducer = (state: KioskState, action: KioskAction): KioskState => {
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
      const key = buildCartItemKey(action.payload.product.id, action.payload.modifiers)
      const existingIndex = state.cart.findIndex((item) => item.key === key)

      if (existingIndex >= 0) {
        const updatedCart = [...state.cart]
        const existingItem = updatedCart[existingIndex]
        updatedCart[existingIndex] = {
          ...existingItem,
          quantity: existingItem.quantity + action.payload.quantity,
        }
        return {
          ...state,
          cart: updatedCart,
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
    case 'UPDATE_QTY':
      return {
        ...state,
        cart: state.cart
          .map((item) =>
            item.key === action.payload.key
              ? { ...item, quantity: action.payload.quantity }
              : item,
          )
          .filter((item) => item.quantity > 0),
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
    case 'STORE_ORDER':
      return {
        ...state,
        ordersByNo: {
          ...state.ordersByNo,
          [action.payload.order_no]: action.payload,
        },
      }
    case 'RESET':
      return {
        orderType: null,
        tableLabel: '',
        cart: [],
        note: '',
        ordersByNo: state.ordersByNo,
      }
    default:
      return state
  }
}
