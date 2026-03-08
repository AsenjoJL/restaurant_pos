import type { Role } from '../../features/auth/auth.types'
import type { OrderItem, OrderSource, OrderType, PaymentMethod } from './order'

export type SalesRecord = {
  id: string
  orderId: string
  orderNo: string
  source: OrderSource
  orderType: OrderType
  items: OrderItem[]
  subtotal: number
  discount?: number
  serviceCharge?: number
  tax: number
  total: number
  cogs?: number
  grossProfit?: number
  grossMargin?: number
  paymentMethod: PaymentMethod
  paymentAmount: number
  paymentChange?: number
  paymentReference?: string
  paymentPayer?: string
  processedBy?: {
    id: string
    name: string
    role: Role
  }
  placedAt: string
  paidAt: string
}
