import { env } from '../../../app/config/env'
import { httpClient } from '../../../shared/api/http'
import type { Order } from '../../../shared/types/order'
import type { KioskRepository } from './kiosk.repository'
import type { KioskMenuSnapshot, PlaceKioskOrderInput } from '../types/contracts'

export const kioskRepositoryHttp: KioskRepository = {
  async getMenuSnapshot() {
    return httpClient<KioskMenuSnapshot>(`${env.apiBaseUrl}/kiosk/menu`)
  },
  async placeOrder(payload: PlaceKioskOrderInput) {
    return httpClient<Order>(`${env.apiBaseUrl}/kiosk/orders`, {
      method: 'POST',
      body: payload,
    })
  },
}

