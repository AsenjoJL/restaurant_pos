import type { RootState } from '../../app/store/store'

export const selectCashAdjustmentRequests = (state: RootState) =>
  state.cashAdjustments.requests
export const selectCashAdjustments = (state: RootState) =>
  state.cashAdjustments.adjustments
export const selectCashAdjustmentAudit = (state: RootState) =>
  state.cashAdjustments.audit
