import type { RepositoryResult } from '../../../shared/api/contracts'
import type { Order } from '../../../shared/types/order'
import type {
  CapturePaymentInput,
  CreateOrderInput,
  UpdateOrderInput,
  VoidOrderInput,
} from '../types/contracts'

export interface OrdersRepository {
  list(): RepositoryResult<Order[]>
  getById(id: string): RepositoryResult<Order | null>
  create(payload: CreateOrderInput): RepositoryResult<Order>
  update(id: string, payload: UpdateOrderInput): RepositoryResult<Order>
  capturePayment(id: string, payload: CapturePaymentInput): RepositoryResult<Order>
  cancel(id: string, reason: string): RepositoryResult<Order>
  void(id: string, payload: VoidOrderInput): RepositoryResult<Order>
}
