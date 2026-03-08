import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { buildAuditUser, logAuditEvent } from '../../../shared/lib/audit'
import { products, tables } from '../../../mock/data'
import { selectOrders } from '../orders.selectors'
import {
  filterCashierOrders,
  getCashierHeaderLabel,
  getCashierPermissions,
  getPrimaryActionLabel,
  getReceiptPrintLabel,
  getReplacementActionLabel,
  getReplacementLabel,
  type CashierTab,
  resolveSelectedOrderId,
} from '../cashier.logic'
import {
  cancelOrder,
  closeOrder,
  sendToKitchen,
  updateOrderNote,
} from '../orders.store'
import OrderReceiptSheet from '../../../shared/components/receipt/OrderReceiptSheet'
import OrderReceiptPreview from '../../../shared/components/receipt/OrderReceiptPreview'
import PaymentModal from '../../pos/components/modals/PaymentModal'
import { openPaymentModal, loadDraft, startEditingOrder } from '../../pos/pos.store'
import { buildDraftFromOrder } from '../../pos/pos.utils'
import ReplacementRequestModal from '../components/ReplacementRequestModal'
import CashAdjustmentModal from '../../cash/components/CashAdjustmentModal'
import CashDrawerModal from '../../cash/components/CashDrawerModal'

type ConfirmState = {
  isOpen: boolean
  reason: string
  targetId: string | null
}

function OrdersPage() {
  const dispatch = useAppDispatch()
  const orders = useAppSelector(selectOrders)
  const user = useAppSelector(selectAuthUser)
  const navigate = useNavigate()
  const [tab, setTab] = useState<CashierTab>('unpaid')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [printOrderId, setPrintOrderId] = useState<string | null>(null)
  const [replacementOrderId, setReplacementOrderId] = useState<string | null>(null)
  const [isCashAdjustmentOpen, setIsCashAdjustmentOpen] = useState(false)
  const [isCashDrawerOpen, setIsCashDrawerOpen] = useState(false)
  const [confirm, setConfirm] = useState<ConfirmState>({
    isOpen: false,
    reason: '',
    targetId: null,
  })

  const pendingCount = useMemo(
    () => orders.filter((order) => order.status === 'PENDING_PAYMENT').length,
    [orders],
  )
  const readyCount = useMemo(
    () => orders.filter((order) => order.status === 'READY_FOR_PICKUP').length,
    [orders],
  )

  const filteredOrders = useMemo(
    () => filterCashierOrders(orders, tab, query),
    [orders, query, tab],
  )

  const selectedOrderId = resolveSelectedOrderId(filteredOrders, selectedId)

  const selectedOrder =
    filteredOrders.find((order) => order.id === selectedOrderId) ?? null

  const printOrder = orders.find((order) => order.id === printOrderId) ?? null
  const replacementOrder = orders.find((order) => order.id === replacementOrderId) ?? null

  const role = user?.role
  const {
    canOperateCashier,
    canTakePayment,
    canSendToKitchen,
    canCloseOrder,
    canEditOrder,
    canPrint,
    canCancelOrder,
    isCompleted,
    replacementStatus,
    canRequestReplacement,
    isReplacementLocked,
  } = getCashierPermissions(selectedOrder, role)

  const printLabel = getReceiptPrintLabel(selectedOrder)

  const triggerPrint = (orderId: string) => {
    setPrintOrderId(orderId)
    window.setTimeout(() => window.print(), 300)
    window.setTimeout(() => setPrintOrderId(null), 900)
  }

  const handleTakePayment = () => {
    if (!selectedOrder || !canTakePayment || !canOperateCashier) {
      return
    }
    dispatch(openPaymentModal({ orderId: selectedOrder.id }))
  }

  const handleEditOrder = () => {
    if (!selectedOrder || !canEditOrder) {
      return
    }
    const tableId =
      selectedOrder.order_type === 'DINE_IN' && selectedOrder.table
        ? tables.find((table) => table.name === selectedOrder.table)?.id ?? null
        : null
    dispatch(loadDraft(buildDraftFromOrder(selectedOrder, products, tableId)))
    dispatch(startEditingOrder(selectedOrder.id))
    navigate('/pos')
  }

  const handleSendToKitchen = () => {
    if (!selectedOrder || !canSendToKitchen || isProcessing) {
      return
    }
    setIsProcessing(true)
    dispatch(sendToKitchen({ id: selectedOrder.id }))
    logAuditEvent(dispatch, {
      scope: 'ORDER',
      action: 'SENT_TO_KITCHEN',
      message: `Order ${selectedOrder.order_no} sent to kitchen.`,
      user: buildAuditUser(user),
      entityId: selectedOrder.id,
    })
    setTimeout(() => setIsProcessing(false), 300)
  }

  const handleCloseOrder = () => {
    if (!selectedOrder || !canCloseOrder || isProcessing) {
      return
    }
    setIsProcessing(true)
    dispatch(closeOrder({ id: selectedOrder.id }))
    logAuditEvent(dispatch, {
      scope: 'ORDER',
      action: 'COMPLETED',
      message: `Order ${selectedOrder.order_no} completed.`,
      user: buildAuditUser(user),
      entityId: selectedOrder.id,
    })
    setTimeout(() => setIsProcessing(false), 300)
  }

  const handleCancel = () => {
    if (!confirm.targetId) {
      return
    }
    const order = orders.find((item) => item.id === confirm.targetId)
    dispatch(cancelOrder({ id: confirm.targetId, reason: confirm.reason }))
    if (order) {
      logAuditEvent(dispatch, {
        scope: 'ORDER',
        action: 'CANCELLED',
        message: `Order ${order.order_no} cancelled.`,
        user: buildAuditUser(user),
        entityId: order.id,
        metadata: { reason: confirm.reason },
      })
    }
    setConfirm({ isOpen: false, reason: '', targetId: null })
  }

  const handlePrint = () => {
    if (!selectedOrder || !canPrint) {
      return
    }
    triggerPrint(selectedOrder.id)
  }

  const primaryActionLabel = getPrimaryActionLabel(selectedOrder)
  const headerLabel = getCashierHeaderLabel(tab)
  const replacementActionLabel = getReplacementActionLabel(replacementStatus)

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
          {isCashier ? (
            <Button
              variant="outline"
              onClick={() => setIsCashAdjustmentOpen(true)}
              icon="report"
            >
              Report Wrong Change
            </Button>
          ) : null}
          {canOperateCashier ? (
            <Button
              variant="outline"
              onClick={() => setIsCashDrawerOpen(true)}
              icon="point_of_sale"
            >
              Cash Drawer
            </Button>
          ) : null}
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
                  <div className="cashier-detail-badges">
                    <Badge variant={order.status}>{formatEnumLabel(order.status)}</Badge>
                    {order.replacementStatus && order.replacementStatus !== 'NONE' ? (
                      <span className="chip">
                        {getReplacementLabel(order.replacementStatus)}
                      </span>
                    ) : null}
                  </div>
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
                  {replacementStatus !== 'NONE' ? (
                    <span className="chip">{getReplacementLabel(replacementStatus)}</span>
                  ) : null}
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
                      {item.bundle_items?.length ? (
                        <p className="muted">
                          Includes:{' '}
                          {item.bundle_items
                            .map((bundleItem) => `${bundleItem.quantity}× ${bundleItem.name}`)
                            .join(', ')}
                        </p>
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
                  name="orderNote"
                  maxLength={250}
                  onChange={(event) =>
                    dispatch(updateOrderNote({ id: selectedOrder.id, note: event.target.value }))
                  }
                  disabled={selectedOrder.status === 'CANCELLED' || isCompleted}
                />
              </label>

              <div className="cashier-total-box">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>{formatCurrency(selectedOrder.subtotal)}</span>
                </div>
                {selectedOrder.discount && selectedOrder.discount > 0 ? (
                  <div className="summary-row">
                    <span>Discount</span>
                    <span>- {formatCurrency(selectedOrder.discount)}</span>
                  </div>
                ) : null}
                {selectedOrder.service_charge && selectedOrder.service_charge > 0 ? (
                  <div className="summary-row">
                    <span>Service</span>
                    <span>{formatCurrency(selectedOrder.service_charge)}</span>
                  </div>
                ) : null}
                <div className="summary-row">
                  <span>Tax</span>
                  <span>{formatCurrency(selectedOrder.tax)}</span>
                </div>
                <div className="summary-total">
                  <span>Total due</span>
                  <span>{formatCurrency(selectedOrder.total)}</span>
                </div>
              </div>

              <div className="cashier-actions">
                {isCompleted ? null : canTakePayment ? (
                  <Button
                    variant="primary"
                    size="lg"
                    disabled={!canOperateCashier || isProcessing}
                    onClick={handleTakePayment}
                    icon="payments"
                  >
                    Take Payment
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
                {canEditOrder ? (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleEditOrder}
                    icon="edit"
                  >
                    Edit Order
                  </Button>
                ) : null}
                {canPrint ? (
                  <Button variant="outline" onClick={handlePrint} icon="print">
                    {printLabel}
                  </Button>
                ) : null}
                {isCompleted ? null : (
                  <Button
                    variant="danger"
                    disabled={!canCancelOrder}
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
                )}
                {canRequestReplacement ? (
                  <Button
                    variant="danger"
                    onClick={() => setReplacementOrderId(selectedOrder.id)}
                    icon="restaurant"
                    disabled={isReplacementLocked}
                  >
                    {replacementActionLabel}
                  </Button>
                ) : null}
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

      <PaymentModal />
      <ReplacementRequestModal
        isOpen={Boolean(replacementOrderId)}
        order={replacementOrder}
        onClose={() => setReplacementOrderId(null)}
      />
      <CashAdjustmentModal
        isOpen={isCashAdjustmentOpen}
        onClose={() => setIsCashAdjustmentOpen(false)}
      />
      <CashDrawerModal
        isOpen={isCashDrawerOpen}
        onClose={() => setIsCashDrawerOpen(false)}
      />
    </div>
  )
}

export default OrdersPage
