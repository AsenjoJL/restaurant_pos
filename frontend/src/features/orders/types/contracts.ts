import type { Order, OrderItem, OrderType, PaymentMethod } from '../../../shared/types/order'

export type CreateOrderInput = {
  source: 'KIOSK' | 'STAFF'
  orderType: OrderType
  table: string | null
  note?: string
  items: OrderItem[]
}

export type UpdateOrderInput = Partial<Pick<Order, 'note' | 'items' | 'table' | 'status'>>

export type CapturePaymentInput = {
  method: PaymentMethod
  amount: number
  reference?: string
  payer?: string
}

