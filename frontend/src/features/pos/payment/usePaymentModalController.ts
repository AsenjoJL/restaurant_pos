import { useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../app/store/hooks'
import { selectAuthUser } from '../../auth/auth.selectors'
import {
  buildInventoryDeductionNote,
  buildInventoryShortageMessage,
  calculateOrderCost,
  validateInventoryForOrder,
} from '../../inventory/inventory.logic'
import {
  selectInventoryIngredients,
  selectInventoryRecipes,
} from '../../inventory/inventory.selectors'
import { applyInventoryDeductions, syncSaleDeductions } from '../../inventory/inventory.store'
import { selectOrders } from '../../orders/orders.selectors'
import { capturePaymentAndSend, syncCapturedPayment } from '../../orders/orders.store'
import { addSalesRecord, syncSalesRecord } from '../../sales/sales.store'
import { buildAuditUser, logAuditEvent } from '../../../shared/lib/audit'
import { isPaymentCaptured } from '../../../shared/lib/orders'
import { useScheduledPrint } from '../../../shared/hooks/useScheduledPrint'
import { pushToast } from '../../../shared/store/ui.store'
import type { PaymentMethod } from '../../../shared/types/order'
import { clearDraft, closePaymentModal } from '../pos.store'
import { selectActivePaymentOrderId, selectPosUi, selectTotals } from '../pos.selectors'
import { buildPaymentPayload, derivePaymentInputs } from './payment.utils'

function usePaymentModalController() {
  const dispatch = useAppDispatch()
  const ui = useAppSelector(selectPosUi)
  const totals = useAppSelector(selectTotals)
  const activeOrderId = useAppSelector(selectActivePaymentOrderId)
  const orders = useAppSelector(selectOrders)
  const user = useAppSelector(selectAuthUser)
  const ingredients = useAppSelector(selectInventoryIngredients)
  const recipes = useAppSelector(selectInventoryRecipes)

  const canProcessPayment = user?.role === 'cashier' || user?.role === 'admin'

  const order = useMemo(
    () => orders.find((item) => item.id === activeOrderId) ?? null,
    [activeOrderId, orders],
  )

  const [amountReceivedMap, setAmountReceivedMap] = useState<Record<string, string>>({})
  const [methodMap, setMethodMap] = useState<Record<string, PaymentMethod>>({})
  const [cardRefMap, setCardRefMap] = useState<Record<string, string>>({})
  const [walletRefMap, setWalletRefMap] = useState<Record<string, string>>({})
  const [walletPayerMap, setWalletPayerMap] = useState<Record<string, string>>({})
  const [isProcessing, setIsProcessing] = useState(false)
  const {
    printId: printOrderId,
    schedulePrint: scheduleReceiptPrint,
    clear: clearReceiptPrint,
  } = useScheduledPrint()

  const derived = derivePaymentInputs({
    activeOrderId,
    order,
    fallbackTotal: totals.total,
    amountReceivedMap,
    methodMap,
    cardRefMap,
    walletRefMap,
    walletPayerMap,
    isPaymentCaptured,
  })

  const handleMethodChange = (method: PaymentMethod) => {
    if (!activeOrderId) return
    setMethodMap((prev) => ({ ...prev, [activeOrderId]: method }))
  }

  const handleAmountReceivedChange = (value: string) => {
    if (!activeOrderId) return
    setAmountReceivedMap((prev) => ({ ...prev, [activeOrderId]: value }))
  }

  const handleCardReferenceChange = (value: string) => {
    if (!activeOrderId) return
    setCardRefMap((prev) => ({ ...prev, [activeOrderId]: value }))
  }

  const handleWalletReferenceChange = (value: string) => {
    if (!activeOrderId) return
    setWalletRefMap((prev) => ({ ...prev, [activeOrderId]: value }))
  }

  const handleWalletPayerChange = (value: string) => {
    if (!activeOrderId) return
    setWalletPayerMap((prev) => ({ ...prev, [activeOrderId]: value }))
  }

  const handleClose = () => {
    if (activeOrderId) {
      setAmountReceivedMap((prev) => ({ ...prev, [activeOrderId]: '' }))
      setMethodMap((prev) => ({ ...prev, [activeOrderId]: 'CASH' }))
      setCardRefMap((prev) => ({ ...prev, [activeOrderId]: '' }))
      setWalletRefMap((prev) => ({ ...prev, [activeOrderId]: '' }))
      setWalletPayerMap((prev) => ({ ...prev, [activeOrderId]: '' }))
    }
    setIsProcessing(false)
    clearReceiptPrint()
    dispatch(closePaymentModal())
  }

  const handleConfirm = () => {
    if (!order) {
      dispatch(
        pushToast({
          title: 'Missing order',
          description: 'No active order was found for payment.',
          variant: 'error',
        }),
      )
      return
    }
    if (!canProcessPayment) {
      dispatch(
        pushToast({
          title: 'Not authorized',
          description: 'Only cashiers or admins can confirm payments.',
          variant: 'error',
        }),
      )
      return
    }
    if (derived.isInsufficient) {
      dispatch(
        pushToast({
          title: 'Insufficient amount',
          description: 'Amount received is less than total due.',
          variant: 'error',
        }),
      )
      return
    }
    if (derived.missingReference) {
      dispatch(
        pushToast({
          title: 'Reference required',
          description: 'Enter a reference number for digital payments.',
          variant: 'error',
        }),
      )
      return
    }

    const validation = validateInventoryForOrder(order, recipes, ingredients)
    if (!validation.ok) {
      dispatch(
        pushToast({
          title: 'Inventory shortage',
          description:
            buildInventoryShortageMessage(validation.shortages) ||
            'Inventory is insufficient to fulfill this order.',
          variant: 'error',
        }),
      )
      return
    }

    const inventoryNote =
      validation.deductions.length > 0
        ? buildInventoryDeductionNote(ingredients, validation.deductions, order.order_no)
        : undefined

    if (validation.deductions.length > 0) {
      dispatch(
        applyInventoryDeductions({
          orderId: order.id,
          orderNo: order.order_no,
          deductions: validation.deductions,
        }),
      )
      void dispatch(
        syncSaleDeductions({
          orderId: order.id,
          orderNo: order.order_no,
          deductions: validation.deductions,
        }),
      )
    }

    const paymentPayload = buildPaymentPayload({
      paymentMethod: derived.paymentMethod,
      isCash: derived.isCash,
      amountNumber: derived.amountNumber,
      total: derived.total,
      change: derived.change,
      cardReference: derived.cardReference,
      requiresReference: derived.requiresReference,
      walletReference: derived.walletReference,
      walletPayer: derived.walletPayer,
    })

    setIsProcessing(true)
    const paidAt = new Date().toISOString()
    const cogs = calculateOrderCost(order, recipes, ingredients)
    const grossProfit = order.total - cogs
    const grossMargin = order.total > 0 ? grossProfit / order.total : 0
    logAuditEvent(dispatch, {
      scope: 'PAYMENT',
      action: 'PAYMENT_CONFIRMED',
      message: `Payment confirmed for order ${order.order_no}.`,
      user: buildAuditUser(user),
      entityId: order.id,
      metadata: {
        method: paymentPayload.method,
        amount: paymentPayload.amount,
      },
    })
    dispatch(
      capturePaymentAndSend({
        id: order.id,
        inventoryNote,
        payment: paymentPayload,
        processedBy: user ? { id: user.id, name: user.name, role: user.role } : undefined,
      }),
    )
    void dispatch(syncCapturedPayment({ id: order.id }))
    dispatch(
      addSalesRecord({
        orderId: order.id,
        orderNo: order.order_no,
        source: order.source,
        orderType: order.order_type,
        items: order.items,
        subtotal: order.subtotal,
        discount: order.discount ?? 0,
        serviceCharge: order.service_charge ?? 0,
        tax: order.tax,
        total: order.total,
        cogs,
        grossProfit,
        grossMargin,
        paymentMethod: paymentPayload.method,
        paymentAmount: paymentPayload.amount,
        paymentChange: paymentPayload.change,
        paymentReference: paymentPayload.reference,
        paymentPayer: paymentPayload.payer,
        processedBy: user ? { id: user.id, name: user.name, role: user.role } : undefined,
        placedAt: order.placed_at,
        paidAt,
      }),
    )
    void dispatch(syncSalesRecord({ orderId: order.id }))
    dispatch(
      pushToast({
        title: 'Payment recorded',
        description: `Order ${order.order_no} sent to kitchen.`,
        variant: 'success',
      }),
    )
    scheduleReceiptPrint(order.id)
    if (order.source === 'STAFF') {
      dispatch(clearDraft())
    }
    window.setTimeout(() => setIsProcessing(false), 300)
  }

  return {
    activeOrderId,
    canProcessPayment,
    derived,
    handleAmountReceivedChange,
    handleCardReferenceChange,
    handleClose,
    handleConfirm,
    handleMethodChange,
    handleWalletPayerChange,
    handleWalletReferenceChange,
    isProcessing,
    order,
    printOrderId,
    ui,
  }
}

export default usePaymentModalController
