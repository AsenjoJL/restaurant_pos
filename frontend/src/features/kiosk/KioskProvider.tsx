import type { ReactNode } from 'react'
import { useCallback, useMemo, useReducer } from 'react'
import {
  KioskContext,
  type AddItemPayload,
  computeKioskTotals,
  initialKioskState,
  type KioskContextValue,
  kioskReducer,
  makeKioskOrder,
  newOrderNumber,
} from './kiosk.state'

export function KioskProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(kioskReducer, initialKioskState)
  const totals = useMemo(() => computeKioskTotals(state.cart), [state.cart])

  const setOrderType = useCallback<KioskContextValue['setOrderType']>(
    (orderType) => dispatch({ type: 'SET_ORDER_TYPE', payload: orderType }),
    [],
  )
  const setTable = useCallback<KioskContextValue['setTable']>(
    (value) => dispatch({ type: 'SET_TABLE', payload: value }),
    [],
  )
  const addItem = useCallback<KioskContextValue['addItem']>(
    (payload: AddItemPayload) => dispatch({ type: 'ADD_ITEM', payload }),
    [],
  )
  const updateQuantity = useCallback<KioskContextValue['updateQuantity']>(
    (key, quantity) => dispatch({ type: 'UPDATE_QTY', payload: { key, quantity } }),
    [],
  )
  const removeItem = useCallback<KioskContextValue['removeItem']>(
    (key) => dispatch({ type: 'REMOVE_ITEM', payload: key }),
    [],
  )
  const setNote = useCallback<KioskContextValue['setNote']>(
    (value) => dispatch({ type: 'SET_NOTE', payload: value }),
    [],
  )
  const clearCart = useCallback<KioskContextValue['clearCart']>(
    () => dispatch({ type: 'CLEAR_CART' }),
    [],
  )
  const rememberOrder = useCallback<KioskContextValue['rememberOrder']>(
    (order) => dispatch({ type: 'STORE_ORDER', payload: order }),
    [],
  )
  const reset = useCallback<KioskContextValue['reset']>(() => dispatch({ type: 'RESET' }), [])

  const placeOrder = useCallback<KioskContextValue['placeOrder']>(() => {
    if (!state.orderType || state.cart.length === 0) {
      return null
    }
    const orderNumber = newOrderNumber()
    const placedAt = new Date().toISOString()
    const order = makeKioskOrder({
      orderNo: orderNumber,
      orderType: state.orderType,
      tableLabel: state.tableLabel,
      cart: state.cart,
      note: state.note,
      totals,
      placedAt,
    })
    return { orderNumber, order }
  }, [
    state.cart,
    state.note,
    state.orderType,
    state.tableLabel,
    totals,
  ])

  const value = useMemo<KioskContextValue>(
    () => ({
      state,
      totals,
      setOrderType,
      setTable,
      addItem,
      updateQuantity,
      removeItem,
      setNote,
      clearCart,
      placeOrder,
      rememberOrder,
      reset,
    }),
    [
      addItem,
      clearCart,
      placeOrder,
      rememberOrder,
      removeItem,
      reset,
      setNote,
      setOrderType,
      setTable,
      state,
      totals,
      updateQuantity,
    ],
  )

  return <KioskContext.Provider value={value}>{children}</KioskContext.Provider>
}

export default KioskProvider
