import type { Role } from '../../features/auth/auth.types'

export type OrderSource = 'KIOSK' | 'STAFF'

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'HOLD'
  | 'SENT_TO_KITCHEN'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'PAID'
  | 'COMPLETED'
  | 'CANCELLED'

export type OrderType = 'DINE_IN' | 'TAKEOUT'

export type PaymentMethod = 'CASH' | 'CARD' | 'GCASH' | 'OTHER'

export type ReplacementStatus = 'NONE' | 'PENDING' | 'APPROVED'
export type ReplacementRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export type OrderItem = {
  id: string
  name: string
  price: number
  quantity: number
  modifiers?: string[]
  note?: string
  bundle_items?: {
    id: string
    name: string
    price: number
    quantity: number
    modifiers?: string[]
  }[]
}

export type ReplacementItem = {
  productId: string
  name: string
  qty: number
}

export type ReplacementRequest = {
  id: string
  orderId: string
  items: ReplacementItem[]
  reason: string
  status: ReplacementRequestStatus
  requestedByUserId: string
  requestedAt: string
  approvedByUserId?: string
  approvedAt?: string
  reviewNote?: string
}

export type ReplacementTicketStatus = 'SENT_TO_KITCHEN' | 'PREPARING' | 'READY_FOR_PICKUP'

export type ReplacementTicket = {
  id: string
  orderId: string
  orderNo: string
  items: ReplacementItem[]
  status: ReplacementTicketStatus
  createdAt: string
}

export type OrderTotals = {
  subtotal: number
  tax: number
  total: number
}

export type AuditAction = 'CANCEL' | 'VOID' | 'REFUND' | 'PAYMENT' | 'STATUS'

export type AuditEntry = {
  id: string
  action: AuditAction
  note: string
  at: string
}

export type Order = {
  id: string
  order_no: string
  source: OrderSource
  status: OrderStatus
  order_type: OrderType
  table: string | null
  items: OrderItem[]
  note?: string
  subtotal: number
  tax: number
  total: number
  payment_method?: PaymentMethod
  payment_amount?: number
  payment_change?: number
  payment_reference?: string
  payment_payer?: string
  processed_by?: {
    id: string
    name: string
    role: Role
  }
  replacementStatus?: ReplacementStatus
  replacementCount?: number
  placed_at: string
  audit_log: AuditEntry[]
}
