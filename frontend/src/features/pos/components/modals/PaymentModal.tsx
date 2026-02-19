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

function PaymentModal() {
  const dispatch = useAppDispatch()
  const ui = useAppSelector(selectPosUi)
  const totals = useAppSelector(selectTotals)
  const activeOrderId = useAppSelector(selectActivePaymentOrderId)
  const orders = useAppSelector(selectOrders)

  const order = useMemo(
    () => orders.find((item) => item.id === activeOrderId) ?? null,
    [activeOrderId, orders],
  )

  const [amountReceivedMap, setAmountReceivedMap] = useState<Record<string, string>>({})
  const [isProcessing, setIsProcessing] = useState(false)
  const [printOrderId, setPrintOrderId] = useState<string | null>(null)

  const amountReceived = activeOrderId ? amountReceivedMap[activeOrderId] ?? '' : ''
  const total = order?.total ?? totals.total
  const paymentCaptured = order ? isPaymentCaptured(order) : false

  const amountNumber = Number(amountReceived)
  const hasAmount = amountReceived.trim().length > 0
  const isAmountValid = hasAmount && !Number.isNaN(amountNumber)
  const change = isAmountValid ? amountNumber - total : 0
  const isInsufficient = !isAmountValid || change < 0

  const triggerPrint = (orderId: string) => {
    setPrintOrderId(orderId)
    window.setTimeout(() => window.print(), 300)
    window.setTimeout(() => setPrintOrderId(null), 900)
  }

  const handleClose = () => {
    if (activeOrderId) {
      setAmountReceivedMap((prev) => ({ ...prev, [activeOrderId]: '' }))
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
    setIsProcessing(true)
    dispatch(capturePaymentAndPrepare({ id: order.id }))
    dispatch(
      pushToast({
        title: 'Payment recorded',
        description: `Order ${order.order_no} sent to kitchen.`,
        variant: 'success',
      }),
    )
    triggerPrint(order.id)
    dispatch(clearDraft())
    setTimeout(() => setIsProcessing(false), 300)
  }

  return (
    <Modal
      isOpen={ui.isPaymentOpen}
      title="Cash Payment"
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
              disabled={!order || isProcessing || isInsufficient}
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
            <div className="payment-row">
              <span className="payment-label">Order total</span>
              <strong>{formatCurrency(total)}</strong>
            </div>
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
