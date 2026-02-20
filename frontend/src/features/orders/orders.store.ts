import { createSlice, nanoid } from '@reduxjs/toolkit'
import { orders as initialOrders } from '../../mock/data'
import type {
  AuditAction,
  Order,
  OrderStatus,
  PaymentMethod,
  ReplacementItem,
  ReplacementRequest,
  ReplacementRequestStatus,
  ReplacementTicket,
} from '../../shared/types/order'

export const ORDERS_STORAGE_KEY = 'pos.orders.v1'

type OrdersState = {
  list: Order[]
  replacementRequests: ReplacementRequest[]
  replacementTickets: ReplacementTicket[]
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
  replacementRequests: [],
  replacementTickets: [],
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

type PaymentPayload = {
  method: PaymentMethod
  amount: number
  change?: number
  reference?: string
  payer?: string
}

type ProcessedByPayload = {
  id: string
  name: string
  role: 'admin' | 'cashier' | 'kitchen'
}

type ReplacementRequestPayload = {
  id: string
  orderId: string
  items: ReplacementItem[]
  reason: string
  requestedBy: ProcessedByPayload
}

type ReviewReplacementPayload = {
  requestId: string
  approvedBy: ProcessedByPayload
  reviewNote?: string
  status: ReplacementRequestStatus
}

const applyPaymentDetails = (
  order: Order,
  payment?: PaymentPayload,
  processedBy?: ProcessedByPayload,
) => {
  if (!payment) {
    return
  }
  order.payment_method = payment.method
  order.payment_amount = payment.amount
  order.payment_change = payment.change
  order.payment_reference = payment.reference
  order.payment_payer = payment.payer
  if (processedBy) {
    order.processed_by = {
      id: processedBy.id,
      name: processedBy.name,
      role: processedBy.role,
    }
  }
}

const getReplacementStatusAfterReject = (order: Order) =>
  order.replacementCount && order.replacementCount > 0 ? 'APPROVED' : 'NONE'

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
      action: {
        payload: {
          id: string
          inventoryNote?: string
          payment?: PaymentPayload
          processedBy?: ProcessedByPayload
        }
      },
    ) => {
      const order = state.list.find((item) => item.id === action.payload.id)
      if (!order || order.status !== 'PENDING_PAYMENT') {
        return
      }
      setStatus(order, 'PAID')
      applyPaymentDetails(order, action.payload.payment, action.payload.processedBy)
      addAuditEntry(
        order,
        'PAYMENT',
        `Payment captured at counter${action.payload.payment ? ` (${action.payload.payment.method})` : ''}.`,
      )
      if (action.payload.inventoryNote) {
        addAuditEntry(order, 'STATUS', action.payload.inventoryNote)
      }
      setStatus(order, 'SENT_TO_KITCHEN', 'Auto-sent to kitchen after payment.')
    },
    capturePaymentAndPrepare: (
      state,
      action: {
        payload: {
          id: string
          inventoryNote?: string
          payment?: PaymentPayload
          processedBy?: ProcessedByPayload
        }
      },
    ) => {
      const order = state.list.find((item) => item.id === action.payload.id)
      if (!order || order.status !== 'PENDING_PAYMENT') {
        return
      }
      setStatus(order, 'PAID')
      applyPaymentDetails(order, action.payload.payment, action.payload.processedBy)
      addAuditEntry(
        order,
        'PAYMENT',
        `Payment captured at counter${action.payload.payment ? ` (${action.payload.payment.method})` : ''}.`,
      )
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
    createReplacementRequest: (state, action: { payload: ReplacementRequestPayload }) => {
      const order = state.list.find((item) => item.id === action.payload.orderId)
      if (!order || order.status !== 'COMPLETED') {
        return
      }
      if (action.payload.requestedBy.role !== 'cashier') {
        return
      }
      if (order.replacementStatus === 'PENDING') {
        return
      }
      if (action.payload.items.length === 0 || action.payload.reason.trim().length === 0) {
        return
      }

      order.replacementStatus = 'PENDING'
      state.replacementRequests.unshift({
        id: action.payload.id,
        orderId: action.payload.orderId,
        items: action.payload.items,
        reason: action.payload.reason.trim(),
        status: 'PENDING',
        requestedByUserId: action.payload.requestedBy.id,
        requestedAt: new Date().toISOString(),
      })
      addAuditEntry(
        order,
        'STATUS',
        `Replacement requested: ${action.payload.reason.trim()}.`,
      )
    },
    reviewReplacementRequest: (state, action: { payload: ReviewReplacementPayload }) => {
      const request = state.replacementRequests.find(
        (item) => item.id === action.payload.requestId,
      )
      if (!request || request.status !== 'PENDING') {
        return
      }
      if (action.payload.approvedBy.role !== 'admin') {
        return
      }
      const order = state.list.find((item) => item.id === request.orderId)
      if (!order) {
        return
      }

      request.status = action.payload.status
      request.approvedByUserId = action.payload.approvedBy.id
      request.approvedAt = new Date().toISOString()
      request.reviewNote = action.payload.reviewNote

      if (action.payload.status === 'REJECTED') {
        order.replacementStatus = getReplacementStatusAfterReject(order)
        addAuditEntry(
          order,
          'STATUS',
          `Replacement rejected: ${action.payload.reviewNote ?? 'No note'}.`,
        )
        return
      }

      if (action.payload.status !== 'APPROVED') {
        return
      }

      order.replacementStatus = 'APPROVED'
      order.replacementCount = (order.replacementCount ?? 0) + 1

      state.replacementTickets.unshift({
        id: nanoid(),
        orderId: request.orderId,
        orderNo: order.order_no,
        items: request.items,
        status: 'SENT_TO_KITCHEN',
        createdAt: new Date().toISOString(),
      })

      addAuditEntry(
        order,
        'STATUS',
        `Replacement approved: ${request.reason}.`,
      )
    },
    startReplacementTicket: (
      state,
      action: { payload: { id: string } },
    ) => {
      const ticket = state.replacementTickets.find((item) => item.id === action.payload.id)
      if (!ticket || ticket.status !== 'SENT_TO_KITCHEN') {
        return
      }
      ticket.status = 'PREPARING'
    },
    markReplacementReady: (
      state,
      action: { payload: { id: string } },
    ) => {
      const ticket = state.replacementTickets.find((item) => item.id === action.payload.id)
      if (!ticket || ticket.status !== 'PREPARING') {
        return
      }
      ticket.status = 'READY_FOR_PICKUP'
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
  createReplacementRequest,
  reviewReplacementRequest,
  startReplacementTicket,
  markReplacementReady,
} = ordersSlice.actions

export default ordersSlice.reducer
