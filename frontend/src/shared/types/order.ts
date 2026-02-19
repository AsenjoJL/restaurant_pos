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

export type OrderItem = {
  id: string
  name: string
  price: number
  quantity: number
  modifiers?: string[]
  note?: string
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
  placed_at: string
  audit_log: AuditEntry[]
}
