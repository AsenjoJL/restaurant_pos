import { fetchAllLaravelCollection, fetchLaravelItem } from '../../../shared/api/laravel'
import { resolveApiAssetUrl } from '../../../shared/api/http'
import type { Order } from '../../../shared/types/order'
import type { KioskRepository } from './kiosk.repository'
import type { KioskMenuSnapshot, PlaceKioskOrderInput } from '../types/contracts'
import type { MenuCategory, MenuProduct } from '../../pos/pos.types'

type LaravelCategory = {
  id: string
  name: string
  is_active: boolean
}

type LaravelProduct = {
  id: string
  name: string
  description: string | null
  price: number
  product_class: 'RAW' | 'NON_RAW'
  category_id: string
  image_url?: string | null
  is_active: boolean
}

const tones: MenuProduct['tone'][] = ['sun', 'mint', 'berry', 'ocean', 'clay', 'orchard']
const KIOSK_PAGE_SIZE = 250
const KIOSK_CATEGORIES_ENDPOINT = `/api/v1/categories?per_page=${KIOSK_PAGE_SIZE}`
const KIOSK_PRODUCTS_ENDPOINT = `/api/v1/products?per_page=${KIOSK_PAGE_SIZE}&product_class=NON_RAW`

const toMenuCategory = (item: LaravelCategory): MenuCategory => ({
  id: item.id,
  name: item.name,
})

const toMenuProduct = (item: LaravelProduct, index: number): MenuProduct => ({
  id: item.id,
  name: item.name,
  description: item.description ?? '',
  price: Number(item.price),
  categoryId: item.category_id,
  tone: tones[index % tones.length],
  image: resolveApiAssetUrl(item.image_url) ?? undefined,
  availability: item.is_active ? 'AVAILABLE' : 'SOLD_OUT',
})

export const kioskRepositoryHttp: KioskRepository = {
  async getMenuSnapshot(): Promise<KioskMenuSnapshot> {
    const [categories, products] = await Promise.all([
      fetchAllLaravelCollection<LaravelCategory>(KIOSK_CATEGORIES_ENDPOINT),
      fetchAllLaravelCollection<LaravelProduct>(KIOSK_PRODUCTS_ENDPOINT),
    ])

    return {
      categories: categories.filter((item) => item.is_active).map(toMenuCategory),
      products: products.filter((item) => item.is_active && item.product_class === 'NON_RAW').map(toMenuProduct),
    }
  },
  async placeOrder(payload: PlaceKioskOrderInput): Promise<Order> {
    return fetchLaravelItem<Order>('/api/v1/orders', {
      method: 'POST',
      body: JSON.stringify({
        source: 'KIOSK',
        order_type: payload.orderType,
        restaurant_table_id: payload.table,
        note: payload.note,
        items: payload.items.map((item) => ({
          product_id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          modifiers: item.modifiers ?? [],
          note: item.note,
          bundle_items: item.bundle_items ?? [],
        })),
      }),
    })
  },
}
