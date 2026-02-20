import { createSlice, nanoid } from '@reduxjs/toolkit'
import type { Role } from '../auth/auth.types'
import type {
  CashAdjustment,
  CashAdjustmentAudit,
  CashAdjustmentRequest,
  CashAdjustmentStatus,
  CashAdjustmentType,
} from '../../shared/types/cash'

type CashState = {
  requests: CashAdjustmentRequest[]
  adjustments: CashAdjustment[]
  audit: CashAdjustmentAudit[]
}

type UserPayload = {
  id: string
  name: string
  role: Role
}

type CreateRequestPayload = {
  id: string
  type: CashAdjustmentType
  amount: number
  reason: string
  relatedOrderId?: string
  requestedBy: UserPayload
}

type ReviewRequestPayload = {
  requestId: string
  status: CashAdjustmentStatus
  reviewNote?: string
  reviewedBy: UserPayload
}

const initialState: CashState = {
  requests: [],
  adjustments: [],
  audit: [],
}

const addAuditEntry = (
  state: CashState,
  requestId: string,
  action: CashAdjustmentAudit['action'],
  note: string,
  by: UserPayload,
) => {
  state.audit.unshift({
    id: nanoid(),
    requestId,
    action,
    note,
    by,
    at: new Date().toISOString(),
  })
}

const cashSlice = createSlice({
  name: 'cashAdjustments',
  initialState,
  reducers: {
    createCashAdjustmentRequest: (state, action: { payload: CreateRequestPayload }) => {
      const { requestedBy, amount, reason } = action.payload
      if (requestedBy.role !== 'cashier') {
        return
      }
      if (amount <= 0 || reason.trim().length === 0) {
        return
      }
      const request: CashAdjustmentRequest = {
        id: action.payload.id,
        type: action.payload.type,
        amount,
        reason: reason.trim(),
        relatedOrderId: action.payload.relatedOrderId,
        status: 'PENDING',
        requestedByUserId: requestedBy.id,
        requestedAt: new Date().toISOString(),
      }
      state.requests.unshift(request)
      addAuditEntry(
        state,
        request.id,
        'REQUESTED',
        `Cash adjustment requested: ${request.type} ${request.amount}.`,
        requestedBy,
      )
    },
    reviewCashAdjustmentRequest: (state, action: { payload: ReviewRequestPayload }) => {
      const request = state.requests.find((item) => item.id === action.payload.requestId)
      if (!request || request.status !== 'PENDING') {
        return
      }
      if (action.payload.reviewedBy.role !== 'admin') {
        return
      }

      request.status = action.payload.status
      request.reviewedByUserId = action.payload.reviewedBy.id
      request.reviewedAt = new Date().toISOString()
      request.reviewNote = action.payload.reviewNote

      if (action.payload.status === 'REJECTED') {
        addAuditEntry(
          state,
          request.id,
          'REJECTED',
          action.payload.reviewNote?.trim() || 'Rejected cash adjustment.',
          action.payload.reviewedBy,
        )
        return
      }

      if (action.payload.status !== 'APPROVED') {
        return
      }

      state.adjustments.unshift({
        id: nanoid(),
        requestId: request.id,
        type: request.type,
        amount: request.amount,
        reason: request.reason,
        relatedOrderId: request.relatedOrderId,
        processedBy: action.payload.reviewedBy,
        createdAt: new Date().toISOString(),
      })

      addAuditEntry(
        state,
        request.id,
        'APPROVED',
        action.payload.reviewNote?.trim() || 'Approved cash adjustment.',
        action.payload.reviewedBy,
      )
    },
  },
})

export const {
  createCashAdjustmentRequest,
  reviewCashAdjustmentRequest,
} = cashSlice.actions

export default cashSlice.reducer
