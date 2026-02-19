import { formatCurrency } from '../../../shared/lib/format'
import { formatEnumLabel } from '../../../shared/lib/orders'
import type { Order } from '../../../shared/types/order'

type SlipTemplateProps = {
  order: Order
  showTotals?: boolean
}

const formatPlacedAt = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return date.toLocaleString()
}

function SlipTemplate({ order, showTotals = true }: SlipTemplateProps) {
  return (
    <div className="slip-sheet">
      <div className="slip-header">
        <h2 className="slip-brand">ASENTER RESTAURANT</h2>
        <p className="muted">Urgello Branch</p>
      </div>

      <div className="slip-number">{order.order_no}</div>

      <div className="slip-meta">
        <span>{formatPlacedAt(order.placed_at)}</span>
        <span>
          {order.order_type === 'DINE_IN'
            ? order.table ?? 'Dine-in'
            : formatEnumLabel(order.order_type)}
        </span>
      </div>

      <div className="slip-items">
        {order.items.map((item) => (
          <div key={`${order.id}-${item.id}`} className="slip-item">
            <div className="slip-item-row">
              <span>
                {item.quantity} × {item.name}
              </span>
              <span>{formatCurrency(item.quantity * item.price)}</span>
            </div>
            {item.modifiers?.length ? (
              <div className="slip-item-meta">{item.modifiers.join(', ')}</div>
            ) : null}
            {item.note ? <div className="slip-item-meta">Note: {item.note}</div> : null}
          </div>
        ))}
      </div>

      {showTotals ? (
        <div className="slip-totals">
          <div className="slip-row">
            <span>Subtotal (est.)</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          <div className="slip-row">
            <span>Tax (est.)</span>
            <span>{formatCurrency(order.tax)}</span>
          </div>
          <div className="slip-row slip-total">
            <span>Total (est.)</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
        </div>
      ) : null}

      <div className="slip-footer">Proceed to counter to pay.</div>
    </div>
  )
}

export default SlipTemplate
