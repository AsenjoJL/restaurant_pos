import type { Order, OrderItem } from '../../../shared/types/order'
import type { MenuCategory, MenuProduct } from '../../pos/pos.types'

export type KioskMenuSnapshot = {
  categories: MenuCategory[]
  products: MenuProduct[]
}

export type PlaceKioskOrderInput = {
  orderType: Order['order_type']
  table: string | null
  note?: string
  items: OrderItem[]
}

