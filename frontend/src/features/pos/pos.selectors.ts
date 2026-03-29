import type { RootState } from '../../app/store/store'
import { calculateTotals } from './pos.utils'
import { calculateCartSubtotal, evaluatePromoCode } from './promo.engine'

export const selectDraft = (state: RootState) => state.pos.draft
export const selectPosUi = (state: RootState) => state.pos.ui
export const selectCartItems = (state: RootState) => state.pos.draft.items
export const selectPromoEvaluation = (state: RootState) => {
  const draft = state.pos.draft
  const subtotal = calculateCartSubtotal(draft.items)
  return evaluatePromoCode({
    code: draft.promoCode,
    subtotal,
    orderType: draft.orderType,
  })
}
export const selectTotals = (state: RootState) => {
  const draft = state.pos.draft
  const promo = selectPromoEvaluation(state)
  const combinedDiscount = draft.discount + (promo?.isValid ? promo.discount : 0)
  return calculateTotals(draft.items, combinedDiscount, draft.serviceCharge, draft.taxRate)
}
export const selectActiveCategory = (state: RootState) => state.pos.ui.activeCategoryId
export const selectSearchTerm = (state: RootState) => state.pos.ui.searchTerm
export const selectActivePaymentOrderId = (state: RootState) => state.pos.ui.activeOrderId
export const selectEditingOrderId = (state: RootState) => state.pos.ui.editingOrderId
