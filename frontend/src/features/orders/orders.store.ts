import { createSlice, nanoid } from '@reduxjs/toolkit'
import { orders as initialOrders } from '../../mock/data'
import type { AuditAction, Order, OrderStatus } from '../../shared/types/order'

export const ORDERS_STORAGE_KEY = 'pos.orders.v1'

type OrdersState = {
  list: Order[]
}

const loadStoredOrders = () => {
  if (typeof window === 'undefined') {
    return null
  }
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY)
    if (!raw) {
      return null
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as Order[]) : null
  } catch {
    return null
  }
}

const initialState: OrdersState = {
  list: loadStoredOrders() ?? initialOrders,
}

const addAuditEntry = (order: Order, action: AuditAction, note: string) => {
  order.audit_log.push({
    id: nanoid(),
    action,
    note,
    at: new Date().toISOString(),
  })
}

const sanitizeNote = (value: string) =>
  value
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 250)

const setStatus = (order: Order, status: OrderStatus, note?: string) => {
  order.status = status
  if (note) {
    addAuditEntry(order, 'STATUS', note)
  }
}

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setOrders: (state, action: { payload: Order[] }) => {
      state.list = action.payload
    },
    addOrder: (state, action: { payload: Order }) => {
      const exists = state.list.some((order) => order.id === action.payload.id)
      if (exists) {
        return
      }
      state.list.unshift(action.payload)
    },
    capturePaymentAndSend: (
      state,
      action: { payload: { id: string; inventoryNote?: string } },
    ) => {
      const order = state.list.find((item) => item.id === action.payload.id)
      if (!order || order.status !== 'PENDING_PAYMENT') {
        return
      }
      setStatus(order, 'PAID')
      addAuditEntry(order, 'PAYMENT', 'Payment captured at counter.')
      if (action.payload.inventoryNote) {
        addAuditEntry(order, 'STATUS', action.payload.inventoryNote)
      }
      setStatus(order, 'SENT_TO_KITCHEN', 'Auto-sent to kitchen after payment.')
    },
    capturePaymentAndPrepare: (
      state,
      action: { payload: { id: string; inventoryNote?: string } },
    ) => {
      const order = state.list.find((item) => item.id === action.payload.id)
      if (!order || order.status !== 'PENDING_PAYMENT') {
        return
      }
      setStatus(order, 'PAID')
      addAuditEntry(order, 'PAYMENT', 'Payment captured at counter.')
      if (action.payload.inventoryNote) {
        addAuditEntry(order, 'STATUS', action.payload.inventoryNote)
      }
      setStatus(order, 'PREPARING', 'Auto-started prep after payment.')
    },
    markPaid: (state, action: { payload: { id: string; note?: string } }) => {
      const order = state.list.find((item) => item.id === action.payload.id)
      if (!order || order.status !== 'PENDING_PAYMENT') {
        return
      }
      setStatus(order, 'PAID')
      addAuditEntry(order, 'PAYMENT', action.payload.note ?? 'Payment captured at counter.')
    },
    sendToKitchen: (state, action: { payload: { id: string; note?: string } }) => {
      const order = state.list.find((item) => item.id === action.payload.id)
      if (!order) {
        return
      }
      if (order.status !== 'PENDING_PAYMENT' && order.status !== 'HOLD') {
        return
      }
      setStatus(order, 'SENT_TO_KITCHEN', action.payload.note ?? 'Sent to kitchen.')
    },
    startPreparing: (state, action: { payload: { id: string } }) => {
      const order = state.list.find((item) => item.id === action.payload.id)
      if (!order || order.status !== 'SENT_TO_KITCHEN') {
        return
      }
      setStatus(order, 'PREPARING')
    },
    markReady: (state, action: { payload: { id: string } }) => {
      const order = state.list.find((item) => item.id === action.payload.id)
      if (!order || order.status !== 'PREPARING') {
        return
      }
      setStatus(order, 'READY_FOR_PICKUP')
    },
    closeOrder: (state, action: { payload: { id: string } }) => {
      const order = state.list.find((item) => item.id === action.payload.id)
      if (!order || order.status !== 'READY_FOR_PICKUP') {
        return
      }
      setStatus(order, 'COMPLETED')
      addAuditEntry(order, 'STATUS', 'Order completed.')
    },
    cancelOrder: (state, action: { payload: { id: string; reason: string } }) => {
      const order = state.list.find((item) => item.id === action.payload.id)
      if (
        !order ||
        order.status === 'COMPLETED' ||
        order.status === 'CANCELLED' ||
        order.audit_log.some((entry) => entry.action === 'PAYMENT')
      ) {
        return
      }
      setStatus(order, 'CANCELLED')
      addAuditEntry(order, 'CANCEL', action.payload.reason)
    },
    updateOrderNote: (state, action: { payload: { id: string; note: string } }) => {
      const order = state.list.find((item) => item.id === action.payload.id)
      if (!order) {
        return
      }
      const nextNote = sanitizeNote(action.payload.note)
      order.note = nextNote.length > 0 ? nextNote : undefined
    },
  },
})

export const {
  setOrders,
  addOrder,
  capturePaymentAndSend,
  capturePaymentAndPrepare,
  markPaid,
  sendToKitchen,
  startPreparing,
  markReady,
  closeOrder,
  cancelOrder,
  updateOrderNote,
} = ordersSlice.actions

export default ordersSlice.reducer
