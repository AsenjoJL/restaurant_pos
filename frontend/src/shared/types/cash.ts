import type { Role } from '../../features/auth/auth.types'

export type CashAdjustmentType = 'SHORTAGE' | 'OVERAGE'
export type CashAdjustmentStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export type CashAdjustmentRequest = {
  id: string
  type: CashAdjustmentType
  amount: number
  reason: string
  relatedOrderId?: string
  status: CashAdjustmentStatus
  requestedByUserId: string
  requestedAt: string
  reviewedByUserId?: string
  reviewedAt?: string
  reviewNote?: string
}

export type CashAdjustment = {
  id: string
  requestId: string
  type: CashAdjustmentType
  amount: number
  reason: string
  relatedOrderId?: string
  processedBy: {
    id: string
    name: string
    role: Role
  }
  createdAt: string
}

export type CashAdjustmentAudit = {
  id: string
  requestId: string
  action: 'REQUESTED' | 'APPROVED' | 'REJECTED'
  note: string
  by: {
    id: string
    name: string
    role: Role
  }
  at: string
}
