import type { Role } from '../auth/auth.types'
import { isPaymentCaptured } from '../../shared/lib/orders'
import type { Order, ReplacementStatus } from '../../shared/types/order'

export type CashierTab = 'unpaid' | 'paid' | 'ready' | 'completed'

export const getCashierHeaderLabel = (tab: CashierTab) => {
  if (tab === 'unpaid') {
    return 'Awaiting Payment'
  }
  if (tab === 'paid') {
    return 'Paid Orders (In Kitchen)'
  }
  if (tab === 'ready') {
    return 'Ready Orders'
  }
  return 'Completed Orders'
}

export const filterCashierOrders = (orders: Order[], tab: CashierTab, query: string) => {
  const trimmed = query.trim().toUpperCase()
  return orders.filter((order) => {
    if (order.status === 'CANCELLED') {
      return false
    }

    const isReady = order.status === 'READY_FOR_PICKUP'
    const isCompleted = order.status === 'COMPLETED'
    const paid = isPaymentCaptured(order)
    const isPaidInProgress = paid && !isReady && !isCompleted
    const isUnpaid = order.status === 'PENDING_PAYMENT'

    if (tab === 'unpaid' && !isUnpaid) {
      return false
    }
    if (tab === 'paid' && !isPaidInProgress) {
      return false
    }
    if (tab === 'ready' && !isReady) {
      return false
    }
    if (tab === 'completed' && !isCompleted) {
      return false
    }

    if (!trimmed) {
      return true
    }
    return order.order_no.toUpperCase().includes(trimmed)
  })
}

export const resolveSelectedOrderId = (orders: Order[], selectedId: string | null) => {
  if (selectedId && orders.some((order) => order.id === selectedId)) {
    return selectedId
  }
  return orders[0]?.id ?? null
}

type CashierPermissions = {
  canOperateCashier: boolean
  canTakePayment: boolean
  canSendToKitchen: boolean
  canCloseOrder: boolean
  canEditOrder: boolean
  canPrint: boolean
  canCancelOrder: boolean
  isCompleted: boolean
  replacementStatus: ReplacementStatus
  canRequestReplacement: boolean
  isReplacementLocked: boolean
}

export const getCashierPermissions = (
  order: Order | null,
  role: Role | undefined,
  options?: { adminOverride?: boolean },
): CashierPermissions => {
  const canOperateCashier =
    role === 'cashier' || (role === 'admin' && Boolean(options?.adminOverride))
  const isCompleted = order?.status === 'COMPLETED'
  const replacementStatus = order?.replacementStatus ?? 'NONE'

  if (!order) {
    return {
      canOperateCashier,
      canTakePayment: false,
      canSendToKitchen: false,
      canCloseOrder: false,
      canEditOrder: false,
      canPrint: false,
      canCancelOrder: false,
      isCompleted: false,
      replacementStatus: 'NONE',
      canRequestReplacement: false,
      isReplacementLocked: false,
    }
  }

  const canTakePayment = order.status === 'PENDING_PAYMENT'
  const canSendToKitchen = order.status === 'HOLD'
  const canCloseOrder = order.status === 'READY_FOR_PICKUP'
  const canEditOrder = order.status === 'PENDING_PAYMENT' && canOperateCashier
  const canPrint = order.status !== 'CANCELLED' && order.status !== 'PENDING_PAYMENT'
  const canCancelOrder =
    canOperateCashier &&
    order.status !== 'COMPLETED' &&
    order.status !== 'CANCELLED' &&
    !isPaymentCaptured(order)
  const canRequestReplacement = isCompleted && role === 'cashier'
  const isReplacementLocked = replacementStatus === 'PENDING' || replacementStatus === 'APPROVED'

  return {
    canOperateCashier,
    canTakePayment,
    canSendToKitchen,
    canCloseOrder,
    canEditOrder,
    canPrint,
    canCancelOrder,
    isCompleted,
    replacementStatus,
    canRequestReplacement,
    isReplacementLocked,
  }
}

export const getPrimaryActionLabel = (order: Order | null) => {
  if (!order) {
    return 'Send to Kitchen'
  }
  if (order.status === 'READY_FOR_PICKUP') {
    return 'Close Order (Completed)'
  }
  if (order.status === 'HOLD') {
    return 'Send to Kitchen'
  }
  if (order.status === 'COMPLETED') {
    return 'Completed'
  }
  if (order.status === 'CANCELLED') {
    return 'Cancelled'
  }
  return 'In Kitchen'
}

export const getReplacementLabel = (status: ReplacementStatus) => {
  if (status === 'PENDING') {
    return 'Replacement Pending'
  }
  if (status === 'APPROVED') {
    return 'Replacement Approved'
  }
  return ''
}

export const getReplacementActionLabel = (status: ReplacementStatus) => {
  if (status === 'PENDING') {
    return 'Replacement Requested'
  }
  if (status === 'APPROVED') {
    return 'Replacement Approved'
  }
  return 'Request Replacement'
}

export const getReceiptPrintLabel = (order: Order | null) => {
  if (!order) {
    return 'Print Receipt'
  }
  return isPaymentCaptured(order) ? 'Print Receipt' : 'Print Invoice'
}
