import { formatCurrency } from '../../lib/format'
import { formatEnumLabel } from '../../lib/orders'
import type { Order } from '../../types/order'
import PrintPortal from './PrintPortal'

type OrderReceiptSheetProps = {
  order: Order
  variant: 'receipt' | 'invoice'
}

const formatPlacedAt = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return date.toLocaleString()
}

function OrderReceiptSheet({ order, variant }: OrderReceiptSheetProps) {
  const title = variant === 'receipt' ? 'Receipt' : 'Invoice'
  const totalLabel = variant === 'receipt' ? 'Paid' : 'Amount due'

  return (
    <PrintPortal>
      <section className="print-sheet" aria-hidden>
        <div className="receipt-preview receipt-print">
          <div className="receipt-header">
            <div>
              <h3>{title}</h3>
            </div>
            <div className="receipt-meta">
              <span>Order {order.order_no}</span>
              <span>
                {order.order_type === 'DINE_IN'
                  ? order.table ?? 'Dine-in'
                  : formatEnumLabel(order.order_type)}
              </span>
              <span>{formatPlacedAt(order.placed_at)}</span>
            </div>
          </div>

          <div className="receipt-items">
            {order.items.map((item) => (
              <div key={`${order.id}-${item.id}`} className="receipt-line">
                <div>
                  <span className="receipt-item-name">{item.name}</span>
                  {item.modifiers?.length ? (
                    <span className="receipt-item-meta">{item.modifiers.join(', ')}</span>
                  ) : null}
                  {item.bundle_items?.length ? (
                    <span className="receipt-item-meta">
                      Includes:{' '}
                      {item.bundle_items
                        .map((bundleItem) => `${bundleItem.quantity}× ${bundleItem.name}`)
                        .join(', ')}
                    </span>
                  ) : null}
                  {item.note ? (
                    <span className="receipt-item-meta">Note: {item.note}</span>
                  ) : null}
                </div>
                <span className="receipt-item-qty">
                  {item.quantity} × {formatCurrency(item.price)}
                </span>
                <span className="receipt-item-total">
                  {formatCurrency(item.quantity * item.price)}
                </span>
              </div>
            ))}
          </div>

          <div className="receipt-summary">
            <div className="receipt-row">
              <span>Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="receipt-row">
              <span>Tax</span>
              <span>{formatCurrency(order.tax)}</span>
            </div>
            <div className="receipt-total">
              <span>{totalLabel}</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </div>

          {variant === 'receipt' && order.payment_method ? (
            <div className="receipt-payment">
              <div className="receipt-row">
                <span>Payment method</span>
                <span>{formatEnumLabel(order.payment_method)}</span>
              </div>
              <div className="receipt-row">
                <span>Amount paid</span>
                <span>{formatCurrency(order.payment_amount ?? order.total)}</span>
              </div>
              {order.payment_method === 'CASH' && order.payment_change !== undefined ? (
                <div className="receipt-row">
                  <span>Change</span>
                  <span>{formatCurrency(order.payment_change)}</span>
                </div>
              ) : null}
              {order.payment_reference ? (
                <div className="receipt-row">
                  <span>Reference</span>
                  <span>{order.payment_reference}</span>
                </div>
              ) : null}
              {order.payment_payer ? (
                <div className="receipt-row">
                  <span>Payer</span>
                  <span>{order.payment_payer}</span>
                </div>
              ) : null}
              {order.processed_by ? (
                <div className="receipt-row">
                  <span>Processed by</span>
                  <span>{order.processed_by.name}</span>
                </div>
              ) : null}
            </div>
          ) : null}

          {order.note ? (
            <div className="receipt-note">
              <span className="input-label">Order note</span>
              <p>{order.note}</p>
            </div>
          ) : null}

          <div className="receipt-footer muted">
            {variant === 'receipt'
              ? 'Payment collected at the counter.'
              : 'Please pay at the counter to release this order.'}
          </div>
        </div>
      </section>
    </PrintPortal>
  )
}

export default OrderReceiptSheet
