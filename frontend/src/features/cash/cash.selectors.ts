import type { RootState } from '../../app/store/store'

export const selectCashAdjustmentRequests = (state: RootState) =>
  state.cashAdjustments.requests
export const selectCashAdjustments = (state: RootState) =>
  state.cashAdjustments.adjustments
export const selectCashAdjustmentAudit = (state: RootState) =>
  state.cashAdjustments.audit

export const selectCashDrawerShifts = (state: RootState) =>
  state.cashAdjustments.drawer.shifts
export const selectCashDrawerActiveShiftId = (state: RootState) =>
  state.cashAdjustments.drawer.activeShiftId
export const selectCashDrawerAudit = (state: RootState) =>
  state.cashAdjustments.drawer.audit
