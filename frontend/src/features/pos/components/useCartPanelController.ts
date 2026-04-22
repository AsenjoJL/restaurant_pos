import { useAppDispatch, useAppSelector } from '../../../app/store/hooks'
import { useCommandLock } from '../../../shared/hooks/useCommandLock'
import { formatCurrency } from '../../../shared/lib/format'
import { pushToast } from '../../../shared/store/ui.store'
import { selectAuthUser } from '../../auth/auth.selectors'
import {
  addOrder,
  syncCreateOrder,
  syncOrderUpdate,
  updatePendingOrder,
} from '../../orders/orders.store'
import { selectDraft, selectEditingOrderId, selectPromoEvaluation, selectTotals } from '../pos.selectors'
import {
  clearDraft,
  clearItems,
  clearPromoCode,
  openConfirm,
  openModifierModal,
  openPaymentModal,
  setDiscount,
  setItemNote,
  setItemQuantity,
  setOrderNotes,
  setOrderType,
  setPromoCode,
  setTable,
  stopEditingOrder,
} from '../pos.store'
import type { CartItem, OrderType } from '../pos.types'
import { buildStaffOrder, generateStaffOrderNumber, mapDraftItemsToOrderItems } from '../pos.utils'
import { evaluatePromoCode, normalizePromoCode } from '../promo.engine'

function useCartPanelController() {
  const dispatch = useAppDispatch()
  const draft = useAppSelector(selectDraft)
  const totals = useAppSelector(selectTotals)
  const promo = useAppSelector(selectPromoEvaluation)
  const editingOrderId = useAppSelector(selectEditingOrderId)
  const user = useAppSelector(selectAuthUser)
  const { isLocked: isPaying, withLock: withPayLock } = useCommandLock('pos.pay')

  const isEditing = Boolean(editingOrderId)
  const discountValue = draft.discount > 0 ? String(draft.discount) : ''

  const handleApplyPromo = (inputValue: string) => {
    const normalized = normalizePromoCode(inputValue)
    if (!normalized) {
      dispatch(
        pushToast({
          title: 'Promo required',
          description: 'Enter a promo code first.',
          variant: 'error',
        }),
      )
      return
    }

    const evaluation = evaluatePromoCode({
      code: normalized,
      subtotal: totals.subtotal,
      orderType: draft.orderType,
    })

    if (!evaluation || !evaluation.isValid) {
      dispatch(
        pushToast({
          title: 'Promo not applied',
          description: evaluation?.reason ?? 'Promo is invalid.',
          variant: 'error',
        }),
      )
      return
    }

    dispatch(setPromoCode(normalized))
    dispatch(
      pushToast({
        title: 'Promo applied',
        description: `${evaluation.label} (-${formatCurrency(evaluation.discount)})`,
        variant: 'success',
      }),
    )
  }

  const handleRemovePromo = () => {
    dispatch(clearPromoCode())
    dispatch(
      pushToast({
        title: 'Promo removed',
        description: 'Discount code was removed from this order.',
        variant: 'info',
      }),
    )
  }

  const validateCheckout = (emptyMessage: string) => {
    if (draft.items.length === 0) {
      dispatch(
        pushToast({
          title: 'Cart is empty',
          description: emptyMessage,
          variant: 'error',
        }),
      )
      return false
    }

    if (draft.orderType === 'dine-in' && !draft.tableId) {
      dispatch(
        pushToast({
          title: 'Table required',
          description: 'Enter a table label for dine-in orders.',
          variant: 'error',
        }),
      )
      return false
    }

    return true
  }

  const handleCheckout = () => {
    if (!validateCheckout('Add items before checkout.')) {
      return
    }

    const orderNo = generateStaffOrderNumber()
    const placedAt = new Date().toISOString()
    const tableLabel = draft.tableId && draft.orderType === 'dine-in' ? draft.tableId.trim() : ''

    const order = buildStaffOrder({
      orderNo,
      draft,
      totals,
      tableLabel,
      placedAt,
    })

    dispatch(addOrder(order))
    void dispatch(syncCreateOrder({ order }))
    dispatch(openPaymentModal({ orderId: order.id }))
  }

  const handleUpdateAndPay = () => {
    if (!editingOrderId) {
      return
    }
    if (!validateCheckout('Add items before taking payment.')) {
      return
    }

    dispatch(
      updatePendingOrder({
        id: editingOrderId,
        items: mapDraftItemsToOrderItems(draft.items),
        note: draft.notes,
        subtotal: totals.subtotal,
        discount: totals.discount,
        serviceCharge: totals.service,
        tax: totals.tax,
        total: totals.total,
        modifiedBy: user ? { id: user.id, name: user.name, role: user.role } : undefined,
      }),
    )
    void dispatch(syncOrderUpdate({ id: editingOrderId }))
    dispatch(openPaymentModal({ orderId: editingOrderId }))
    dispatch(stopEditingOrder())
    dispatch(clearDraft())
  }

  const handleQuantityChange = (item: CartItem, nextQuantity: number) => {
    dispatch(
      setItemQuantity({
        productId: item.product.id,
        quantity: nextQuantity,
      }),
    )
  }

  const handleCheckoutAction = () =>
    withPayLock(() => {
      if (isEditing) {
        handleUpdateAndPay()
      } else {
        handleCheckout()
      }
    })

  return {
    discountValue,
    draft,
    handleApplyPromo,
    handleCheckoutAction,
    handleClearDraft: () => dispatch(clearDraft()),
    handleClearItems: () => dispatch(clearItems()),
    handleDiscountChange: (value: string) => {
      const next = value.trim()
      dispatch(setDiscount(next.length === 0 ? 0 : Number(next)))
    },
    handleItemDecrease: (item: CartItem) => handleQuantityChange(item, item.quantity - 1),
    handleItemIncrease: (item: CartItem) => handleQuantityChange(item, item.quantity + 1),
    handleItemNoteChange: (item: CartItem, value: string) =>
      dispatch(setItemNote({ productId: item.product.id, note: value })),
    handleItemVoid: (item: CartItem) =>
      dispatch(openConfirm({ intent: 'void-item', targetId: item.product.id })),
    handleOpenModifiers: (item: CartItem) => dispatch(openModifierModal(item.product.id)),
    handleOrderNotesChange: (value: string) => dispatch(setOrderNotes(value)),
    handleOrderTypeChange: (value: OrderType) => dispatch(setOrderType(value)),
    handleRemovePromo,
    handleTableChange: (value: string | null) => dispatch(setTable(value)),
    handleCancelEdit: () => {
      dispatch(stopEditingOrder())
      dispatch(clearDraft())
    },
    isEditing,
    isPaying,
    promo,
    staffName: user?.name ?? 'Unassigned',
    totals,
  }
}

export default useCartPanelController
