import { env } from '../../../app/config/env'
import { httpClient } from '../../../shared/api/http'
import type { Order } from '../../../shared/types/order'
import type { OrdersRepository } from './orders.repository'
import type { CapturePaymentInput, CreateOrderInput, UpdateOrderInput } from '../types/contracts'

export const ordersRepositoryHttp: OrdersRepository = {
  async list() {
    return httpClient<Order[]>(`${env.apiBaseUrl}/orders`)
  },
  async getById(id: string) {
    return httpClient<Order | null>(`${env.apiBaseUrl}/orders/${id}`)
  },
  async create(payload: CreateOrderInput) {
    return httpClient<Order>(`${env.apiBaseUrl}/orders`, {
      method: 'POST',
      body: payload,
    })
  },
  async update(id: string, payload: UpdateOrderInput) {
    return httpClient<Order>(`${env.apiBaseUrl}/orders/${id}`, {
      method: 'PATCH',
      body: payload,
    })
  },
  async capturePayment(id: string, payload: CapturePaymentInput) {
    return httpClient<Order>(`${env.apiBaseUrl}/orders/${id}/pay`, {
      method: 'POST',
      body: payload,
    })
  },
  async cancel(id: string, reason: string) {
    return httpClient<Order>(`${env.apiBaseUrl}/orders/${id}/cancel`, {
      method: 'POST',
      body: { reason },
    })
  },
}

