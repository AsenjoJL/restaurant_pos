import { useAppSelector } from '../../../app/store/hooks'
import { selectAdminSettings } from '../../../features/admin/admin.selectors'
import { formatCurrency } from '../../lib/format'
import { formatEnumLabel } from '../../lib/orders'
import type { Order } from '../../types/order'
import { formatDate, formatPlacedAt, formatTaxRate, formatTime } from './receipt.utils'

type ReceiptContentProps = {
  order: Order
  variant: 'receipt' | 'invoice'
}

function ReceiptContent({ order, variant }: ReceiptContentProps) {
  const settings = useAppSelector(selectAdminSettings)
  const taxRateLabel = formatTaxRate(order)
  const amountReceived = order.payment_amount ?? order.total
  const tableNo = order.table?.trim() ? order.table.trim() : 'N/A'
  const totalLabel = variant === 'receipt' ? 'Amount Paid' : 'Amount Due'
  const customFooter = settings.receiptFooter?.trim() ?? ''
  const showCustomFooter =
    customFooter.length > 0 && customFooter.toLowerCase() !== 'thank you for dining with us.'

  return (
    <>
      <div className="receipt-header">
        <div className="receipt-brand">
          <h3>{settings.storeName}</h3>
          <p className="receipt-brand-subtitle">
            {variant === 'receipt' ? 'Official Receipt' : 'Order Invoice'}
          </p>
        </div>
        <div className="receipt-meta">
          <span>Order No: {order.order_no}</span>
          <span>Table No: {tableNo}</span>
          <span>Order Type: {formatEnumLabel(order.order_type)}</span>
          <span>Date: {formatDate(order.placed_at)}</span>
          <span>Time: {formatTime(order.placed_at)}</span>
        </div>
      </div>

      <div className="receipt-items">
        <div className="receipt-line receipt-line-header">
          <span>Item Name</span>
          <span className="receipt-item-qty">Qty x Price</span>
          <span className="receipt-item-total">Total</span>
        </div>
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
                    .map((bundleItem) => `${bundleItem.quantity}x ${bundleItem.name}`)
                    .join(', ')}
                </span>
              ) : null}
              {item.note ? <span className="receipt-item-meta">Note: {item.note}</span> : null}
            </div>
            <span className="receipt-item-qty">
              {item.quantity} x {formatCurrency(item.price)}
            </span>
            <span className="receipt-item-total">{formatCurrency(item.quantity * item.price)}</span>
          </div>
        ))}
      </div>

      <div className="receipt-summary">
        <div className="receipt-row">
          <span>Subtotal</span>
          <span>{formatCurrency(order.subtotal)}</span>
        </div>
        {order.discount && order.discount > 0 ? (
          <div className="receipt-row">
            <span>Discount</span>
            <span>-{formatCurrency(order.discount)}</span>
          </div>
        ) : null}
        {order.service_charge && order.service_charge > 0 ? (
          <div className="receipt-row">
            <span>Service Charge</span>
            <span>{formatCurrency(order.service_charge)}</span>
          </div>
        ) : null}
        <div className="receipt-row">
          <span>{taxRateLabel ? `Tax (${taxRateLabel})` : 'Tax'}</span>
          <span>{formatCurrency(order.tax)}</span>
        </div>
        <div className="receipt-total receipt-total-highlight">
          <span>{totalLabel}</span>
          <span>{formatCurrency(order.total)}</span>
        </div>
      </div>

      {variant === 'receipt' && order.payment_method ? (
        <div className="receipt-payment">
          <div className="receipt-row">
            <span>Payment Method</span>
            <span>{formatEnumLabel(order.payment_method)}</span>
          </div>
          <div className="receipt-row">
            <span>Amount Received</span>
            <span>{formatCurrency(amountReceived)}</span>
          </div>
          <div className="receipt-row">
            <span>Change</span>
            <span>{formatCurrency(order.payment_change ?? 0)}</span>
          </div>
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
              <span>Processed By</span>
              <span>{order.processed_by.name}</span>
            </div>
          ) : null}
        </div>
      ) : null}

      {order.note ? (
        <div className="receipt-note">
          <span className="input-label">Order Note</span>
          <p>{order.note}</p>
        </div>
      ) : null}
      {order.modified_by ? (
        <div className="receipt-note">
          <span className="input-label">Adjusted By</span>
          <p>
            {order.modified_by.name}
            {order.modified_at ? ` • ${formatPlacedAt(order.modified_at)}` : ''}
          </p>
        </div>
      ) : null}

      {showCustomFooter ? <div className="receipt-footer">{customFooter}</div> : null}
      <div className="receipt-footer">Thank you for dining with us.</div>
    </>
  )
}

export default ReceiptContent
