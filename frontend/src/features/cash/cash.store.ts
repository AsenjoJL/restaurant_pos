import { createSlice, nanoid } from '@reduxjs/toolkit'
import type { Role } from '../auth/auth.types'
import type {
  CashAdjustment,
  CashAdjustmentAudit,
  CashAdjustmentRequest,
  CashAdjustmentStatus,
  CashAdjustmentType,
  CashDrawerAudit,
  CashDrawerAuditAction,
  CashDrawerEntry,
  CashDrawerEntryType,
  CashDrawerShift,
} from '../../shared/types/cash'

type CashState = {
  requests: CashAdjustmentRequest[]
  adjustments: CashAdjustment[]
  audit: CashAdjustmentAudit[]
  drawer: {
    shifts: CashDrawerShift[]
    activeShiftId: string | null
    audit: CashDrawerAudit[]
  }
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

type OpenDrawerPayload = {
  openingFloat: number
  openedBy: UserPayload
}

type CashDrawerEntryPayload = {
  type: CashDrawerEntryType
  amount: number
  reason: string
  relatedOrderId?: string
  createdBy: UserPayload
}

type CloseDrawerPayload = {
  countedCash: number
  expectedCash: number
  notes?: string
  closedBy: UserPayload
}

export const CASH_STORAGE_KEY = 'pos.cash.v1'

const loadStoredCashState = () => {
  if (typeof window === 'undefined') {
    return null
  }
  try {
    const raw = localStorage.getItem(CASH_STORAGE_KEY)
    if (!raw) {
      return null
    }
    const parsed = JSON.parse(raw)
    return parsed as CashState
  } catch {
    return null
  }
}

const defaultState: CashState = {
  requests: [],
  adjustments: [],
  audit: [],
  drawer: {
    shifts: [],
    activeShiftId: null,
    audit: [],
  },
}

const storedState = loadStoredCashState()

const initialState: CashState = storedState
  ? {
      ...defaultState,
      ...storedState,
      drawer: {
        ...defaultState.drawer,
        ...storedState.drawer,
      },
    }
  : defaultState

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

const addDrawerAuditEntry = (
  state: CashState,
  shiftId: string,
  action: CashDrawerAuditAction,
  note: string,
  by: UserPayload,
) => {
  state.drawer.audit.unshift({
    id: nanoid(),
    shiftId,
    action,
    note,
    by,
    at: new Date().toISOString(),
  })
}


const getActiveShift = (state: CashState) =>
  state.drawer.activeShiftId
    ? state.drawer.shifts.find((shift) => shift.id === state.drawer.activeShiftId) ?? null
    : null

const cashSlice = createSlice({
  name: 'cashAdjustments',
  initialState,
  reducers: {
    hydrateCashState: (_state, action: { payload: CashState }) => {
      return {
        ...defaultState,
        ...action.payload,
        drawer: {
          ...defaultState.drawer,
          ...action.payload.drawer,
        },
      }
    },
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
    openCashDrawerShift: (state, action: { payload: OpenDrawerPayload }) => {
      if (action.payload.openedBy.role !== 'cashier' && action.payload.openedBy.role !== 'admin') {
        return
      }
      const openingFloat = action.payload.openingFloat
      if (openingFloat < 0) {
        return
      }
      const activeShift = getActiveShift(state)
      if (activeShift && activeShift.status === 'OPEN') {
        return
      }

      const shift: CashDrawerShift = {
        id: nanoid(),
        status: 'OPEN',
        openingFloat,
        openedAt: new Date().toISOString(),
        openedBy: action.payload.openedBy,
        entries: [],
      }

      state.drawer.shifts.unshift(shift)
      state.drawer.activeShiftId = shift.id
      addDrawerAuditEntry(
        state,
        shift.id,
        'OPEN',
        `Drawer opened with float ${openingFloat}.`,
        action.payload.openedBy,
      )
    },
    addCashDrawerEntry: (state, action: { payload: CashDrawerEntryPayload }) => {
      const activeShift = getActiveShift(state)
      if (!activeShift || activeShift.status !== 'OPEN') {
        return
      }
      if (action.payload.amount <= 0 || action.payload.reason.trim().length === 0) {
        return
      }

      const entry: CashDrawerEntry = {
        id: nanoid(),
        shiftId: activeShift.id,
        type: action.payload.type,
        amount: action.payload.amount,
        reason: action.payload.reason.trim(),
        relatedOrderId: action.payload.relatedOrderId,
        createdAt: new Date().toISOString(),
        createdBy: action.payload.createdBy,
      }

      activeShift.entries.unshift(entry)
      addDrawerAuditEntry(
        state,
        activeShift.id,
        action.payload.type === 'IN' ? 'CASH_IN' : 'CASH_OUT',
        `${action.payload.type === 'IN' ? 'Cash in' : 'Cash out'}: ${
          entry.amount
        }. ${entry.reason}`,
        action.payload.createdBy,
      )
    },
    closeCashDrawerShift: (state, action: { payload: CloseDrawerPayload }) => {
      const activeShift = getActiveShift(state)
      if (!activeShift || activeShift.status !== 'OPEN') {
        return
      }
      if (action.payload.countedCash < 0 || action.payload.expectedCash < 0) {
        return
      }

      activeShift.status = 'CLOSED'
      activeShift.closedAt = new Date().toISOString()
      activeShift.closedBy = action.payload.closedBy
      activeShift.countedCash = action.payload.countedCash
      activeShift.expectedCash = action.payload.expectedCash
      activeShift.variance = action.payload.countedCash - action.payload.expectedCash
      activeShift.notes = action.payload.notes?.trim() || undefined

      state.drawer.activeShiftId = null

      addDrawerAuditEntry(
        state,
        activeShift.id,
        'CLOSE',
        `Drawer closed. Variance ${activeShift.variance?.toFixed(2) ?? '0'}.`,
        action.payload.closedBy,
      )
    },
  },
})

export const {
  hydrateCashState,
  createCashAdjustmentRequest,
  reviewCashAdjustmentRequest,
  openCashDrawerShift,
  addCashDrawerEntry,
  closeCashDrawerShift,
} = cashSlice.actions

export default cashSlice.reducer
