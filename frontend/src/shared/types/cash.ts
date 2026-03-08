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

export type CashDrawerStatus = 'OPEN' | 'CLOSED'
export type CashDrawerEntryType = 'IN' | 'OUT'
export type CashDrawerAuditAction = 'OPEN' | 'CLOSE' | 'COUNT' | 'CASH_IN' | 'CASH_OUT'

export type CashDrawerEntry = {
  id: string
  shiftId: string
  type: CashDrawerEntryType
  amount: number
  reason: string
  relatedOrderId?: string
  createdAt: string
  createdBy: {
    id: string
    name: string
    role: Role
  }
}

export type CashDrawerShift = {
  id: string
  status: CashDrawerStatus
  openingFloat: number
  openedAt: string
  openedBy: {
    id: string
    name: string
    role: Role
  }
  closedAt?: string
  closedBy?: {
    id: string
    name: string
    role: Role
  }
  expectedCash?: number
  countedCash?: number
  variance?: number
  notes?: string
  entries: CashDrawerEntry[]
}

export type CashDrawerAudit = {
  id: string
  shiftId: string
  action: CashDrawerAuditAction
  note: string
  by: {
    id: string
    name: string
    role: Role
  }
  at: string
}
