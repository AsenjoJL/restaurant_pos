import { createAsyncThunk, createSlice, nanoid } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store/store'
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
import { ordersRepository } from './api'
import { kitchenRepository } from '../kitchen/api'
import type { CapturePaymentInput, CreateOrderInput, UpdateOrderInput } from './types/contracts'

export const ORDERS_STORAGE_KEY = 'pos.orders.v2'

export type OrdersState = {
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
    const parsed = JSON.parse(raw) as unknown
    if (Array.isArray(parsed)) {
      return {
        list: parsed as Order[],
        replacementRequests: [],
        replacementTickets: [],
      } satisfies OrdersState
    }
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'list' in parsed &&
      Array.isArray((parsed as OrdersState).list) &&
      'replacementRequests' in parsed &&
      Array.isArray((parsed as OrdersState).replacementRequests) &&
      'replacementTickets' in parsed &&
      Array.isArray((parsed as OrdersState).replacementTickets)
    ) {
      return parsed as OrdersState
    }
    return null
  } catch {
    return null
  }
}

const initialState: OrdersState = {
  ...(loadStoredOrders() ?? {
    list: [],
    replacementRequests: [],
    replacementTickets: [],
  }),
}

const toCreateOrderInput = (order: Order): CreateOrderInput => ({
  id: order.id,
  orderNo: order.order_no,
  source: order.source,
  orderType: order.order_type,
  table: order.table,
  note: order.note,
  items: order.items,
  subtotal: order.subtotal,
  discount: order.discount ?? 0,
  serviceCharge: order.service_charge ?? 0,
  tax: order.tax,
  total: order.total,
  placedAt: order.placed_at,
})

const toUpdateOrderInput = (order: Order): UpdateOrderInput => ({
  items: order.items,
  note: order.note,
  table: order.table,
  status: order.status,
  subtotal: order.subtotal,
  discount: order.discount,
  service_charge: order.service_charge,
  tax: order.tax,
  total: order.total,
})

export const hydrateOrdersFromRepository = createAsyncThunk(
  'orders/hydrateFromRepository',
  async () => ordersRepository.list(),
)

export const syncCreateOrder = createAsyncThunk<void, { order: Order }>(
  'orders/syncCreate',
  async ({ order }) => {
    await ordersRepository.create(toCreateOrderInput(order))
  },
)

export const syncOrderUpdate = createAsyncThunk<
  void,
  { id: string },
  { state: RootState }
>('orders/syncUpdate', async ({ id }, { getState }) => {
  const order = getState().orders.list.find((item) => item.id === id)
  if (!order) {
    return
  }
  await ordersRepository.update(id, toUpdateOrderInput(order))
})

export const syncOrderCancellation = createAsyncThunk<
  void,
  { id: string; reason: string }
>('orders/syncCancel', async ({ id, reason }) => {
  await ordersRepository.cancel(id, reason)
})

export const syncOrderVoid = createAsyncThunk<
  void,
  { id: string; reason: string }
>('orders/syncVoid', async ({ id, reason }) => {
  await ordersRepository.void(id, { reason })
})

export const syncCapturedPayment = createAsyncThunk<
  void,
  { id: string },
  { state: RootState }
>('orders/syncPayment', async ({ id }, { getState }) => {
  const order = getState().orders.list.find((item) => item.id === id)
  if (!order || !order.payment_method || order.payment_amount === undefined) {
    return
  }

  const paymentPayload: CapturePaymentInput = {
    method: order.payment_method,
    amount: order.payment_amount,
    reference: order.payment_reference,
    payer: order.payment_payer,
  }

  await ordersRepository.capturePayment(order.id, paymentPayload)

  if (order.status !== 'PAID') {
    await ordersRepository.update(order.id, { status: order.status })
  }
})

export const hydrateKitchenQueueFromRepository = createAsyncThunk(
  'orders/hydrateKitchenQueueFromRepository',
  async () => kitchenRepository.getQueue(),
)

export const syncKitchenOrderStatus = createAsyncThunk<
  void,
  { id: string; status: 'PREPARING' | 'READY_FOR_PICKUP' | 'COMPLETED' }
>('orders/syncKitchenOrderStatus', async ({ id, status }) => {
  await kitchenRepository.updateOrderStatus(id, { status })
})

export const syncKitchenReplacementStatus = createAsyncThunk<
  void,
  { id: string; status: 'PREPARING' | 'READY_FOR_PICKUP' }
>('orders/syncKitchenReplacementStatus', async ({ id, status }) => {
  await kitchenRepository.updateReplacementStatus(id, { status })
})

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
  const now = new Date().toISOString()
  if (status === 'SENT_TO_KITCHEN' && !order.kitchen_sent_at) {
    order.kitchen_sent_at = now
  }
  if (status === 'PREPARING' && !order.kitchen_started_at) {
    order.kitchen_started_at = now
  }
  if (status === 'READY_FOR_PICKUP' && !order.kitchen_ready_at) {
    order.kitchen_ready_at = now
  }
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

type UpdatePendingOrderPayload = {
  id: string
  items: Order['items']
  note?: string
  subtotal: number
  discount?: number
  serviceCharge?: number
  tax: number
  total: number
  modifiedBy?: ProcessedByPayload
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
    setOrdersState: (state, action: { payload: OrdersState }) => {
      state.list = action.payload.list
      state.replacementRequests = action.payload.replacementRequests
      state.replacementTickets = action.payload.replacementTickets
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
    voidOrder: (state, action: { payload: { id: string; reason: string } }) => {
      const order = state.list.find((item) => item.id === action.payload.id)
      if (
        !order ||
        order.status === 'CANCELLED' ||
        order.audit_log.some((entry) => entry.action === 'VOID')
      ) {
        return
      }
      addAuditEntry(order, 'VOID', action.payload.reason)
    },
    updateOrderNote: (state, action: { payload: { id: string; note: string } }) => {
      const order = state.list.find((item) => item.id === action.payload.id)
      if (!order) {
        return
      }
      const nextNote = sanitizeNote(action.payload.note)
      order.note = nextNote.length > 0 ? nextNote : undefined
    },
    updatePendingOrder: (state, action: { payload: UpdatePendingOrderPayload }) => {
      const order = state.list.find((item) => item.id === action.payload.id)
      if (!order || order.status !== 'PENDING_PAYMENT') {
        return
      }

      order.items = action.payload.items
      order.note = action.payload.note?.trim() || undefined
      order.subtotal = action.payload.subtotal
      order.discount = action.payload.discount ?? 0
      order.service_charge = action.payload.serviceCharge ?? 0
      order.tax = action.payload.tax
      order.total = action.payload.total

      if (action.payload.modifiedBy) {
        order.modified_by = action.payload.modifiedBy
        order.modified_at = new Date().toISOString()
      }

      addAuditEntry(
        order,
        'EDIT',
        `Order modified before payment${action.payload.modifiedBy ? ` by ${action.payload.modifiedBy.name}` : ''}.`,
      )
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
        sentAt: new Date().toISOString(),
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
      ticket.startedAt = ticket.startedAt ?? new Date().toISOString()
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
      ticket.readyAt = ticket.readyAt ?? new Date().toISOString()
    },
  },
  extraReducers: (builder) => {
    builder.addCase(hydrateOrdersFromRepository.fulfilled, (state, action) => {
      state.list = action.payload
    })
    builder.addCase(hydrateKitchenQueueFromRepository.fulfilled, (state, action) => {
      const nextList = [...state.list]
      action.payload.orders.forEach((queueOrder) => {
        const index = nextList.findIndex((order) => order.id === queueOrder.id)
        if (index >= 0) {
          nextList[index] = {
            ...nextList[index],
            ...queueOrder,
          }
          return
        }
        nextList.unshift(queueOrder)
      })
      state.list = nextList
      state.replacementTickets = action.payload.replacementTickets
    })
  },
})

export const {
  setOrders,
  setOrdersState,
  addOrder,
  capturePaymentAndSend,
  capturePaymentAndPrepare,
  markPaid,
  sendToKitchen,
  startPreparing,
  markReady,
  closeOrder,
  cancelOrder,
  voidOrder,
  updateOrderNote,
  updatePendingOrder,
  createReplacementRequest,
  reviewReplacementRequest,
  startReplacementTicket,
  markReplacementReady,
} = ordersSlice.actions

export default ordersSlice.reducer
