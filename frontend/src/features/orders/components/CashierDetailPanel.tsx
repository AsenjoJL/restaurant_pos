import Button from '../../../shared/components/ui/Button'
import { formatCurrency } from '../../../shared/lib/format'
import { isPaymentCaptured } from '../../../shared/lib/orders'
import OrderReceiptPreview from '../../../shared/components/receipt/OrderReceiptPreview'
import {
  getPrimaryActionLabel,
  getReceiptPrintLabel,
  getReplacementActionLabel,
} from '../cashier.logic'
import type { Order, ReplacementStatus } from '../../../shared/types/order'
import CashierOrderBadges from './CashierOrderBadges'
import { getCashierOrderMetaLabel } from '../cashier.utils'

type CashierDetailPanelProps = {
  order: Order | null
  isCompleted: boolean
  canOperateCashier: boolean
  canTakePayment: boolean
  canSendToKitchen: boolean
  canCloseOrder: boolean
  canEditOrder: boolean
  canPrint: boolean
  canCancelOrder: boolean
  canRequestReplacement: boolean
  isReplacementLocked: boolean
  replacementStatus: ReplacementStatus
  isProcessing: boolean
  onOrderNoteChange: (note: string) => void
  onTakePayment: () => void
  onPrimaryAction: () => void
  onEditOrder: () => void
  onPrint: () => void
  onCancelOrder: () => void
  onRequestReplacement: () => void
}

function CashierDetailPanel({
  order,
  isCompleted,
  canOperateCashier,
  canTakePayment,
  canSendToKitchen,
  canCloseOrder,
  canEditOrder,
  canPrint,
  canCancelOrder,
  canRequestReplacement,
  isReplacementLocked,
  replacementStatus,
  isProcessing,
  onOrderNoteChange,
  onTakePayment,
  onPrimaryAction,
  onEditOrder,
  onPrint,
  onCancelOrder,
  onRequestReplacement,
}: CashierDetailPanelProps) {
  if (!order) {
    return (
      <div className="panel cashier-detail">
        <div className="empty-state">
          <h3>No orders found</h3>
          <p className="muted">Try a different search or switch the tab.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="panel cashier-detail">
      <div className="cashier-detail-header">
        <div>
          <h3>Order {order.order_no}</h3>
          <p className="muted">{getCashierOrderMetaLabel(order)}</p>
        </div>
        <CashierOrderBadges order={order} replacementStatus={replacementStatus} />
      </div>

      <div className="cashier-items">
        {order.items.map((item) => (
          <div key={`${item.id}-${item.name}`} className="cashier-item-row">
            <div className="cashier-item-copy">
              <strong>{item.name}</strong>
              <p className="muted">Qty {item.quantity}</p>
              {item.modifiers?.length ? <p className="muted">{item.modifiers.join(', ')}</p> : null}
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
            <span className="cashier-item-price">{formatCurrency(item.quantity * item.price)}</span>
          </div>
        ))}
      </div>

      <label className="input-field">
        <span className="input-label">Order note</span>
        <textarea
          className="textarea"
          placeholder="Add order notes (max 250 chars)"
          value={order.note ?? ''}
          name="orderNote"
          maxLength={250}
          onChange={(event) => onOrderNoteChange(event.target.value)}
          disabled={order.status === 'CANCELLED' || isCompleted}
        />
      </label>

      <div className="cashier-total-box">
        <div className="summary-row">
          <span>Subtotal</span>
          <span>{formatCurrency(order.subtotal)}</span>
        </div>
        {order.discount && order.discount > 0 ? (
          <div className="summary-row">
            <span>Discount</span>
            <span>- {formatCurrency(order.discount)}</span>
          </div>
        ) : null}
        {order.service_charge && order.service_charge > 0 ? (
          <div className="summary-row">
            <span>Service</span>
            <span>{formatCurrency(order.service_charge)}</span>
          </div>
        ) : null}
        <div className="summary-row">
          <span>Tax</span>
          <span>{formatCurrency(order.tax)}</span>
        </div>
        <div className="summary-total">
          <span>Total due</span>
          <span>{formatCurrency(order.total)}</span>
        </div>
      </div>

      <div className="cashier-actions">
        {isCompleted ? null : canTakePayment ? (
          <Button
            variant="primary"
            size="lg"
            disabled={!canOperateCashier || isProcessing}
            onClick={onTakePayment}
          >
            Take Payment
          </Button>
        ) : (
          <Button
            variant="primary"
            size="lg"
            disabled={isProcessing || (!canSendToKitchen && !canCloseOrder)}
            onClick={onPrimaryAction}
          >
            {getPrimaryActionLabel(order)}
          </Button>
        )}
        {canEditOrder ? (
          <Button variant="outline" size="lg" onClick={onEditOrder}>
            Edit Order
          </Button>
        ) : null}
        {canPrint ? (
          <Button variant="outline" onClick={onPrint}>
            {getReceiptPrintLabel(order)}
          </Button>
        ) : null}
        {isCompleted ? null : (
          <Button
            variant="danger"
            disabled={!canCancelOrder}
            onClick={onCancelOrder}
          >
            Cancel Order
          </Button>
        )}
        {canRequestReplacement ? (
          <Button
            variant="danger"
            onClick={onRequestReplacement}
            disabled={isReplacementLocked}
          >
            {getReplacementActionLabel(replacementStatus)}
          </Button>
        ) : null}
      </div>

      {isPaymentCaptured(order) ? (
        <div className="payment-receipt">
          <OrderReceiptPreview order={order} variant="receipt" />
        </div>
      ) : null}
    </div>
  )
}

export default CashierDetailPanel
