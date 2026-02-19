import type { RootState } from '../../app/store/store'
import { calculateTotals } from './pos.utils'

export const selectDraft = (state: RootState) => state.pos.draft
export const selectPosUi = (state: RootState) => state.pos.ui
export const selectCartItems = (state: RootState) => state.pos.draft.items
export const selectTotals = (state: RootState) =>
  calculateTotals(
    state.pos.draft.items,
    state.pos.draft.discount,
    state.pos.draft.serviceCharge,
    state.pos.draft.taxRate,
  )
export const selectActiveCategory = (state: RootState) => state.pos.ui.activeCategoryId
export const selectSearchTerm = (state: RootState) => state.pos.ui.searchTerm
export const selectActivePaymentOrderId = (state: RootState) => state.pos.ui.activeOrderId
