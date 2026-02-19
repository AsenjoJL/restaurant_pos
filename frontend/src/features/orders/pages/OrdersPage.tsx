import { useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../app/store/hooks'
import { selectAuthUser } from '../../auth/auth.selectors'
import Badge from '../../../shared/components/ui/Badge'
import Button from '../../../shared/components/ui/Button'
import ConfirmDialog from '../../../shared/components/ui/ConfirmDialog'
import Input from '../../../shared/components/ui/Input'
import { formatCurrency } from '../../../shared/lib/format'
import {
  formatEnumLabel,
  getItemCount,
  isPaymentCaptured,
} from '../../../shared/lib/orders'
import { normalizeReference } from '../../../shared/lib/validators'
import { pushToast } from '../../../shared/store/ui.store'
import { selectOrders } from '../orders.selectors'
import {
  cancelOrder,
  closeOrder,
  capturePaymentAndSend,
  sendToKitchen,
  updateOrderNote,
} from '../orders.store'
import OrderReceiptSheet from '../../../shared/components/receipt/OrderReceiptSheet'
import OrderReceiptPreview from '../../../shared/components/receipt/OrderReceiptPreview'

type ConfirmState = {
  isOpen: boolean
  reason: string
  targetId: string | null
}

type CashierTab = 'unpaid' | 'paid' | 'ready' | 'completed'

function OrdersPage() {
  const dispatch = useAppDispatch()
  const orders = useAppSelector(selectOrders)
  const user = useAppSelector(selectAuthUser)
  const [tab, setTab] = useState<CashierTab>('unpaid')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [printOrderId, setPrintOrderId] = useState<string | null>(null)
  const [confirm, setConfirm] = useState<ConfirmState>({
    isOpen: false,
    reason: '',
    targetId: null,
  })
  const [amountReceivedMap, setAmountReceivedMap] = useState<Record<string, string>>({})

  const pendingCount = useMemo(
    () => orders.filter((order) => order.status === 'PENDING_PAYMENT').length,
    [orders],
  )
  const readyCount = useMemo(
    () => orders.filter((order) => order.status === 'READY_FOR_PICKUP').length,
    [orders],
  )

  const filteredOrders = useMemo(() => {
    const trimmed = query.trim().toUpperCase()
    return orders.filter((order) => {
      if (order.status === 'CANCELLED') {
        return false
      }

      const isReady = order.status === 'READY_FOR_PICKUP'
      const isCompleted = order.status === 'COMPLETED'
      const paid = isPaymentCaptured(order)
      const isPaidInProgress = paid && !isReady && !isCompleted
      const isUnpaid = order.status === 'PENDING_PAYMENT'

      if (tab === 'unpaid' && !isUnpaid) {
        return false
      }
      if (tab === 'paid' && !isPaidInProgress) {
        return false
      }
      if (tab === 'ready' && !isReady) {
        return false
      }
      if (tab === 'completed' && !isCompleted) {
        return false
      }

      if (!trimmed) {
        return true
      }
      return order.order_no.toUpperCase().includes(trimmed)
    })
  }, [orders, query, tab])

  const selectedOrderId =
    selectedId && filteredOrders.some((order) => order.id === selectedId)
      ? selectedId
      : filteredOrders[0]?.id ?? null

  const selectedOrder =
    filteredOrders.find((order) => order.id === selectedOrderId) ?? null

  const printOrder = orders.find((order) => order.id === printOrderId) ?? null

  const isCashier = user?.role === 'cashier'
  const canTakePayment = selectedOrder?.status === 'PENDING_PAYMENT'
  const canSendToKitchen = selectedOrder?.status === 'HOLD'
  const canCloseOrder = selectedOrder?.status === 'READY_FOR_PICKUP'
  const canPrint = Boolean(selectedOrder && selectedOrder.status !== 'CANCELLED')

  const printLabel =
    selectedOrder && isPaymentCaptured(selectedOrder) ? 'Print Receipt' : 'Print Invoice'

  const amountValue = selectedOrderId ? (amountReceivedMap[selectedOrderId] ?? '') : ''
  const amountNumber = Number(amountValue)
  const hasAmount = amountValue.trim().length > 0
  const isAmountValid = hasAmount && !Number.isNaN(amountNumber)
  const change =
    selectedOrder && isAmountValid ? amountNumber - selectedOrder.total : 0
  const isInsufficient = selectedOrder ? !isAmountValid || change < 0 : true

  const triggerPrint = (orderId: string) => {
    setPrintOrderId(orderId)
    window.setTimeout(() => window.print(), 300)
    window.setTimeout(() => setPrintOrderId(null), 900)
  }

  const handleTakePayment = () => {
    if (!selectedOrder || !canTakePayment || isProcessing || !isCashier) {
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
    dispatch(capturePaymentAndSend({ id: selectedOrder.id }))
    dispatch(
      pushToast({
        title: 'Payment recorded',
        description: `Order ${selectedOrder.order_no} sent to kitchen.`,
        variant: 'success',
      }),
    )
    triggerPrint(selectedOrder.id)
    setTimeout(() => setIsProcessing(false), 300)
  }

  const handleSendToKitchen = () => {
    if (!selectedOrder || !canSendToKitchen || isProcessing) {
      return
    }
    setIsProcessing(true)
    dispatch(sendToKitchen({ id: selectedOrder.id }))
    setTimeout(() => setIsProcessing(false), 300)
  }

  const handleCloseOrder = () => {
    if (!selectedOrder || !canCloseOrder || isProcessing) {
      return
    }
    setIsProcessing(true)
    dispatch(closeOrder({ id: selectedOrder.id }))
    setTimeout(() => setIsProcessing(false), 300)
  }

  const handleCancel = () => {
    if (!confirm.targetId) {
      return
    }
    dispatch(cancelOrder({ id: confirm.targetId, reason: confirm.reason }))
    setConfirm({ isOpen: false, reason: '', targetId: null })
  }

  const handlePrint = () => {
    if (!selectedOrder || !canPrint) {
      return
    }
    triggerPrint(selectedOrder.id)
  }

  const primaryActionLabel = selectedOrder
    ? selectedOrder.status === 'READY_FOR_PICKUP'
      ? 'Close Order (Completed)'
      : selectedOrder.status === 'HOLD'
        ? 'Send to Kitchen'
        : selectedOrder.status === 'COMPLETED'
          ? 'Completed'
          : selectedOrder.status === 'CANCELLED'
            ? 'Cancelled'
            : 'In Kitchen'
    : 'Send to Kitchen'

  const headerLabel =
    tab === 'unpaid'
      ? 'Awaiting Payment'
      : tab === 'paid'
        ? 'Paid Orders (In Kitchen)'
        : tab === 'ready'
          ? 'Ready Orders'
          : 'Completed Orders'

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Cashier Queue</h2>
          <p className="muted">Collect payments, send tickets, and close orders.</p>
        </div>
        <div className="cashier-tools">
          <Input
            placeholder="Search by order number"
            value={query}
            onChange={(event) => setQuery(normalizeReference(event.target.value))}
          />
          <div className="segmented">
            <button
              type="button"
              className={`segmented-button${tab === 'unpaid' ? ' is-active' : ''}`}
              onClick={() => setTab('unpaid')}
            >
              <span className="segmented-label">Pending Payment</span>
              {pendingCount > 0 ? (
                <span className="segmented-badge segmented-badge--pending">
                  {pendingCount}
                </span>
              ) : null}
            </button>
            <button
              type="button"
              className={`segmented-button${tab === 'paid' ? ' is-active' : ''}`}
              onClick={() => setTab('paid')}
            >
              Paid Orders
            </button>
            <button
              type="button"
              className={`segmented-button${tab === 'ready' ? ' is-active' : ''}`}
              onClick={() => setTab('ready')}
            >
              <span className="segmented-label">Ready for Pickup</span>
              {readyCount > 0 ? (
                <span className="segmented-badge segmented-badge--ready">
                  {readyCount}
                </span>
              ) : null}
            </button>
            <button
              type="button"
              className={`segmented-button${tab === 'completed' ? ' is-active' : ''}`}
              onClick={() => setTab('completed')}
            >
              Completed Orders
            </button>
          </div>
        </div>
      </div>

      <div className="cashier-grid">
        <div className="panel cashier-queue">
          <div className="cashier-queue-header">
            <h3>{headerLabel}</h3>
            <span className="muted">{filteredOrders.length} orders</span>
          </div>
          <div className="cashier-list">
            {filteredOrders.map((order) => (
              <button
                key={order.id}
                type="button"
                className={`cashier-card${selectedOrderId === order.id ? ' is-active' : ''}`}
                onClick={() => setSelectedId(order.id)}
              >
                <div className="cashier-card-head">
                  <div>
                    <h3>{order.order_no}</h3>
                    <p className="muted">
                      {order.order_type === 'DINE_IN'
                        ? order.table ?? 'Dine-in'
                        : formatEnumLabel(order.order_type)}
                    </p>
                  </div>
                  <Badge variant={order.status}>{formatEnumLabel(order.status)}</Badge>
                </div>
                <div className="cashier-card-meta">
                  <span className={`chip chip-${order.source.toLowerCase()}`}>
                    {formatEnumLabel(order.source)}
                  </span>
                  <span>{getItemCount(order.items)} items</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="panel cashier-detail">
          {selectedOrder ? (
            <>
              <div className="cashier-detail-header">
                <div>
                  <h3>Order {selectedOrder.order_no}</h3>
                  <p className="muted">
                    {selectedOrder.order_type === 'DINE_IN'
                      ? `Dine-in • ${selectedOrder.table ?? 'No table'}`
                      : formatEnumLabel(selectedOrder.order_type)}
                  </p>
                </div>
                <div className="cashier-detail-badges">
                  <Badge variant={selectedOrder.status}>
                    {formatEnumLabel(selectedOrder.status)}
                  </Badge>
                  <span className={`chip chip-${selectedOrder.source.toLowerCase()}`}>
                    {formatEnumLabel(selectedOrder.source)}
                  </span>
                </div>
              </div>

              <div className="cashier-items">
                {selectedOrder.items.map((item) => (
                  <div key={`${item.id}-${item.name}`} className="cashier-item-row">
                    <div>
                      <strong>{item.name}</strong>
                      <p className="muted">Qty {item.quantity}</p>
                      {item.modifiers?.length ? (
                        <p className="muted">{item.modifiers.join(', ')}</p>
                      ) : null}
                      {item.note ? <p className="muted">Note: {item.note}</p> : null}
                    </div>
                    <span>{formatCurrency(item.quantity * item.price)}</span>
                  </div>
                ))}
              </div>

              <label className="input-field">
                <span className="input-label">Order note</span>
                <textarea
                  className="textarea"
                  placeholder="Add order notes (max 250 chars)"
                  value={selectedOrder.note ?? ''}
                  maxLength={250}
                  onChange={(event) =>
                    dispatch(updateOrderNote({ id: selectedOrder.id, note: event.target.value }))
                  }
                  disabled={selectedOrder.status === 'CANCELLED'}
                />
              </label>

              <div className="cashier-total-box">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>{formatCurrency(selectedOrder.subtotal)}</span>
                </div>
                <div className="summary-row">
                  <span>Tax</span>
                  <span>{formatCurrency(selectedOrder.tax)}</span>
                </div>
                <div className="summary-total">
                  <span>Total due</span>
                  <span>{formatCurrency(selectedOrder.total)}</span>
                </div>
              </div>

              {canTakePayment ? (
                <div className="payment-panel">
                  <div className="payment-row">
                    <span className="payment-label">Order total</span>
                    <strong>{formatCurrency(selectedOrder.total)}</strong>
                  </div>

                  <label className="input-field">
                    <span className="input-label">Amount Received</span>
                    <input
                      className="input"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={amountValue}
                      onChange={(event) => {
                        if (!selectedOrderId) return
                        setAmountReceivedMap((prev) => ({
                          ...prev,
                          [selectedOrderId]: event.target.value,
                        }))
                      }}
                      disabled={!canTakePayment}
                    />
                  </label>

                  <div className="payment-row payment-change">
                    <span>Change</span>
                    <span>
                      {isAmountValid && selectedOrder
                        ? formatCurrency(Math.max(change, 0))
                        : formatCurrency(0)}
                    </span>
                  </div>

                  {hasAmount && change < 0 ? (
                    <div className="payment-error">Insufficient amount</div>
                  ) : null}
                </div>
              ) : null}

              <div className="cashier-actions">
                {canTakePayment ? (
                  <Button
                    variant="primary"
                    size="lg"
                    disabled={!isCashier || isProcessing || isInsufficient}
                    onClick={handleTakePayment}
                    icon="payments"
                  >
                    Confirm Payment
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="lg"
                    disabled={isProcessing || (!canSendToKitchen && !canCloseOrder)}
                    onClick={canCloseOrder ? handleCloseOrder : handleSendToKitchen}
                    icon={canCloseOrder ? 'done_all' : 'restaurant'}
                  >
                    {primaryActionLabel}
                  </Button>
                )}
                <Button
                  variant="outline"
                  disabled={!canPrint}
                  onClick={handlePrint}
                  icon="print"
                >
                  {printLabel}
                </Button>
                <Button
                  variant="danger"
                  disabled={
                    selectedOrder.status === 'COMPLETED' ||
                    selectedOrder.status === 'CANCELLED' ||
                    isPaymentCaptured(selectedOrder)
                  }
                  onClick={() =>
                    setConfirm({
                      isOpen: true,
                      reason: '',
                      targetId: selectedOrder.id,
                    })
                  }
                  icon="cancel"
                >
                  Cancel Order
                </Button>
              </div>

              {selectedOrder && isPaymentCaptured(selectedOrder) ? (
                <div className="payment-receipt">
                  <OrderReceiptPreview order={selectedOrder} variant="receipt" />
                </div>
              ) : null}
            </>
          ) : (
            <div className="empty-state">
              <h3>No orders found</h3>
              <p className="muted">Try a different search or switch the tab.</p>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirm.isOpen}
        title="Cancel order"
        description="Provide a reason for cancelling this order."
        reason={confirm.reason}
        requireReason
        onReasonChange={(value) => setConfirm((prev) => ({ ...prev, reason: value }))}
        onConfirm={handleCancel}
        onCancel={() => setConfirm({ isOpen: false, reason: '', targetId: null })}
        confirmLabel="Cancel order"
      />

      {printOrder ? (
        <OrderReceiptSheet
          order={printOrder}
          variant={isPaymentCaptured(printOrder) ? 'receipt' : 'invoice'}
        />
      ) : null}
    </div>
  )
}

export default OrdersPage
