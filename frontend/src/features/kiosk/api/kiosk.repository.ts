import type { RepositoryResult } from '../../../shared/api/contracts'
import type { Order } from '../../../shared/types/order'
import type { KioskMenuSnapshot, PlaceKioskOrderInput } from '../types/contracts'

export interface KioskRepository {
  getMenuSnapshot(): RepositoryResult<KioskMenuSnapshot>
  placeOrder(payload: PlaceKioskOrderInput): RepositoryResult<Order>
}

