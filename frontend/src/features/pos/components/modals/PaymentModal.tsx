import { useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../../app/store/hooks'
import Button from '../../../../shared/components/ui/Button'
import Input from '../../../../shared/components/ui/Input'
import Modal from '../../../../shared/components/ui/Modal'
import { formatCurrency } from '../../../../shared/lib/format'
import { isPaymentCaptured } from '../../../../shared/lib/orders'
import { pushToast } from '../../../../shared/store/ui.store'
import OrderReceiptPreview from '../../../../shared/components/receipt/OrderReceiptPreview'
import OrderReceiptSheet from '../../../../shared/components/receipt/OrderReceiptSheet'
import { selectOrders } from '../../../orders/orders.selectors'
import { capturePaymentAndPrepare } from '../../../orders/orders.store'
import { clearDraft, closePaymentModal } from '../../pos.store'
import { selectActivePaymentOrderId, selectPosUi, selectTotals } from '../../pos.selectors'
import {
  selectInventoryIngredients,
  selectInventoryRecipes,
} from '../../../inventory/inventory.selectors'
import { applyInventoryDeductions } from '../../../inventory/inventory.store'
import {
  buildInventoryDeductionNote,
  buildInventoryShortageMessage,
  validateInventoryForOrder,
} from '../../../inventory/inventory.logic'
import type { PaymentMethod } from '../../../../shared/types/order'
import { selectAuthUser } from '../../../auth/auth.selectors'

function PaymentModal() {
  const dispatch = useAppDispatch()
  const ui = useAppSelector(selectPosUi)
  const totals = useAppSelector(selectTotals)
  const activeOrderId = useAppSelector(selectActivePaymentOrderId)
  const orders = useAppSelector(selectOrders)
  const user = useAppSelector(selectAuthUser)
  const ingredients = useAppSelector(selectInventoryIngredients)
  const recipes = useAppSelector(selectInventoryRecipes)

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
  const [printOrderId, setPrintOrderId] = useState<string | null>(null)

  const amountReceived = activeOrderId ? amountReceivedMap[activeOrderId] ?? '' : ''
  const total = order?.total ?? totals.total
  const paymentCaptured = order ? isPaymentCaptured(order) : false

  const paymentMethod =
    order?.payment_method ??
    (activeOrderId ? methodMap[activeOrderId] ?? 'CASH' : 'CASH')
  const cardReference =
    order?.payment_reference ?? (activeOrderId ? cardRefMap[activeOrderId] ?? '' : '')
  const walletReference =
    order?.payment_reference ?? (activeOrderId ? walletRefMap[activeOrderId] ?? '' : '')
  const walletPayer =
    order?.payment_payer ?? (activeOrderId ? walletPayerMap[activeOrderId] ?? '' : '')

  const amountNumber = Number(amountReceived)
  const hasAmount = amountReceived.trim().length > 0
  const isAmountValid = hasAmount && !Number.isNaN(amountNumber)
  const change = isAmountValid ? amountNumber - total : 0
  const isCash = paymentMethod === 'CASH'
  const requiresReference = paymentMethod === 'GCASH' || paymentMethod === 'OTHER'
  const isInsufficient = isCash ? !isAmountValid || change < 0 : false
  const missingReference =
    !paymentCaptured && requiresReference && walletReference.trim().length === 0

  const triggerPrint = (orderId: string) => {
    setPrintOrderId(orderId)
    window.setTimeout(() => window.print(), 300)
    window.setTimeout(() => setPrintOrderId(null), 900)
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
    setPrintOrderId(null)
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
    if (isInsufficient) {
      dispatch(
        pushToast({
          title: 'Insufficient amount',
          description: 'Amount received is less than total due.',
          variant: 'error',
        }),
      )
      return
    }
    if (missingReference) {
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
    }

    const paymentAmount = isCash ? amountNumber : total
    const paymentPayload = {
      method: paymentMethod,
      amount: paymentAmount,
      change: isCash ? Math.max(change, 0) : undefined,
      reference:
        paymentMethod === 'CARD'
          ? cardReference.trim() || undefined
          : requiresReference
            ? walletReference.trim() || undefined
            : undefined,
      payer: requiresReference ? walletPayer.trim() || undefined : undefined,
    }

    setIsProcessing(true)
    dispatch(
      capturePaymentAndPrepare({
        id: order.id,
        inventoryNote,
        payment: paymentPayload,
        processedBy: user ? { id: user.id, name: user.name, role: user.role } : undefined,
      }),
    )
    dispatch(
      pushToast({
        title: 'Payment recorded',
        description: `Order ${order.order_no} sent to kitchen.`,
        variant: 'success',
      }),
    )
    triggerPrint(order.id)
    if (order.source === 'STAFF') {
      dispatch(clearDraft())
    }
    setTimeout(() => setIsProcessing(false), 300)
  }

  return (
    <Modal
      isOpen={ui.isPaymentOpen}
      title="Payment"
      onClose={handleClose}
      footer={
        <div className="modal-actions">
          <Button variant="ghost" onClick={handleClose}>
            {paymentCaptured ? 'Done' : 'Cancel'}
          </Button>
          {paymentCaptured && order ? (
            <Button variant="outline" onClick={() => triggerPrint(order.id)} icon="print">
              Print Receipt
            </Button>
          ) : (
            <Button
              variant="primary"
              disabled={!order || isProcessing || isInsufficient || missingReference}
              onClick={handleConfirm}
              icon="payments"
            >
              Confirm Payment
            </Button>
          )}
        </div>
      }
    >
      {!order ? (
        <div className="empty-state">
          <h3>No order loaded</h3>
          <p className="muted">Close and retry checkout.</p>
        </div>
      ) : (
        <>
          <div className="payment-panel">
            <div className="payment-methods">
              {(['CASH', 'CARD', 'GCASH', 'OTHER'] as PaymentMethod[]).map((method) => (
                <button
                  key={method}
                  type="button"
                  className={`payment-method${paymentMethod === method ? ' is-active' : ''}`}
                  onClick={() => {
                    if (!activeOrderId) return
                    setMethodMap((prev) => ({ ...prev, [activeOrderId]: method }))
                  }}
                  disabled={paymentCaptured}
                >
                  {method === 'CASH'
                    ? 'Cash'
                    : method === 'CARD'
                      ? 'Card'
                      : method === 'GCASH'
                        ? 'GCash'
                        : 'Other'}
                </button>
              ))}
            </div>
            <div className="payment-row">
              <span className="payment-label">Order total</span>
              <strong>{formatCurrency(total)}</strong>
            </div>
            {isCash ? (
              <>
                <Input
                  label="Amount Received"
                  placeholder="0.00"
                  value={amountReceived}
                  onChange={(event) => {
                    if (!activeOrderId) return
                    setAmountReceivedMap((prev) => ({
                      ...prev,
                      [activeOrderId]: event.target.value,
                    }))
                  }}
                  inputMode="decimal"
                  disabled={paymentCaptured}
                />
                <div className="payment-row payment-change">
                  <span>Change</span>
                  <span>{formatCurrency(Math.max(change, 0))}</span>
                </div>
                {hasAmount && change < 0 ? (
                  <div className="payment-error">Insufficient amount</div>
                ) : null}
              </>
            ) : null}
            {paymentMethod === 'CARD' ? (
              <Input
                label="Card reference (optional)"
                placeholder="Terminal ref or last 4 digits"
                value={cardReference}
                onChange={(event) => {
                  if (!activeOrderId) return
                  setCardRefMap((prev) => ({
                    ...prev,
                    [activeOrderId]: event.target.value,
                  }))
                }}
                disabled={paymentCaptured}
              />
            ) : null}
            {paymentMethod === 'GCASH' || paymentMethod === 'OTHER' ? (
              <>
                <Input
                  label="Reference number"
                  placeholder="Payment reference"
                  value={walletReference}
                  onChange={(event) => {
                    if (!activeOrderId) return
                    setWalletRefMap((prev) => ({
                      ...prev,
                      [activeOrderId]: event.target.value,
                    }))
                  }}
                  disabled={paymentCaptured}
                  error={missingReference ? 'Reference is required.' : undefined}
                />
                <Input
                  label="Payer name (optional)"
                  placeholder="Customer name"
                  value={walletPayer}
                  onChange={(event) => {
                    if (!activeOrderId) return
                    setWalletPayerMap((prev) => ({
                      ...prev,
                      [activeOrderId]: event.target.value,
                    }))
                  }}
                  disabled={paymentCaptured}
                />
              </>
            ) : null}
          </div>

          {paymentCaptured ? (
            <div className="payment-receipt">
              <OrderReceiptPreview order={order} variant="receipt" />
            </div>
          ) : null}
        </>
      )}

      {printOrderId && order ? (
        <OrderReceiptSheet order={order} variant="receipt" />
      ) : null}
    </Modal>
  )
}

export default PaymentModal
