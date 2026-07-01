import type { Order, OrderItem, OrderType, PaymentMethod } from '../../../shared/types/order'

export type CreateOrderInput = {
  id?: string
  orderNo?: string
  source: 'KIOSK' | 'STAFF'
  orderType: OrderType
  table: string | null
  note?: string
  items: OrderItem[]
  subtotal?: number
  discount?: number
  serviceCharge?: number
  tax?: number
  total?: number
  placedAt?: string
}

export type UpdateOrderInput = Partial<
  Pick<
    Order,
    'note' | 'items' | 'table' | 'status' | 'subtotal' | 'discount' | 'service_charge' | 'tax' | 'total'
  >
>

export type CapturePaymentInput = {
  method: PaymentMethod
  amount: number
  reference?: string
  payer?: string
  next_status?: 'PAID' | 'SENT_TO_KITCHEN' | 'PREPARING'
}

export type VoidOrderInput = {
  reason: string
}
