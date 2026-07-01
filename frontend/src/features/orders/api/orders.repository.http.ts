import { fetchAllLaravelCollection, fetchLaravelItem } from '../../../shared/api/laravel'
import type { Order } from '../../../shared/types/order'
import type { OrdersRepository } from './orders.repository'
import type { CapturePaymentInput, CreateOrderInput, UpdateOrderInput, VoidOrderInput } from '../types/contracts'

type LaravelOrder = Order

const ORDERS_PAGE_SIZE = 250
const ORDERS_ENDPOINT = `/api/v1/orders?per_page=${ORDERS_PAGE_SIZE}`

const normalizeOrder = (order: LaravelOrder): Order => ({
  ...order,
  discount: order.discount ?? 0,
  service_charge: order.service_charge ?? 0,
  audit_log: order.audit_log ?? [],
  items: order.items ?? [],
})

const mapOrderItem = (item: CreateOrderInput['items'][number]) => ({
  product_id: item.id,
  name: item.name,
  price: item.price,
  quantity: item.quantity,
  modifiers: item.modifiers ?? [],
  note: item.note,
  bundle_items: item.bundle_items ?? [],
})

export const ordersRepositoryHttp: OrdersRepository = {
  async list() {
    return (await fetchAllLaravelCollection<LaravelOrder>(ORDERS_ENDPOINT)).map(normalizeOrder)
  },
  async getById(id) {
    return normalizeOrder(await fetchLaravelItem<LaravelOrder>(`/api/v1/orders/${id}`))
  },
  async create(payload: CreateOrderInput) {
    return normalizeOrder(
      await fetchLaravelItem<LaravelOrder>('/api/v1/orders', {
        method: 'POST',
        body: JSON.stringify({
          client_reference: payload.id,
          source: payload.source,
          order_type: payload.orderType,
          note: payload.note,
          items: payload.items.map(mapOrderItem),
        }),
      }),
    )
  },
  async update(id, payload: UpdateOrderInput) {
    return normalizeOrder(
      await fetchLaravelItem<LaravelOrder>(`/api/v1/orders/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          status: payload.status,
          note: payload.note,
          items: payload.items?.map(mapOrderItem),
        }),
      }),
    )
  },
  async capturePayment(id, payload: CapturePaymentInput) {
    return normalizeOrder(
      await fetchLaravelItem<LaravelOrder>(`/api/v1/orders/${id}/capture-payment`, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    )
  },
  async cancel(id, reason: string) {
    return normalizeOrder(
      await fetchLaravelItem<LaravelOrder>(`/api/v1/orders/${id}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),
    )
  },
  async void(id, payload: VoidOrderInput) {
    return normalizeOrder(
      await fetchLaravelItem<LaravelOrder>(`/api/v1/orders/${id}/void`, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    )
  },
}
