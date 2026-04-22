import { useMemo, useState } from 'react'
import { formatCurrency } from '../../../../shared/lib/format'
import type { ConfirmedOrder } from '../../dashboard/dashboard.types'

function OrderHistoryPanel({
  orders,
  isEmpty,
}: {
  orders: ConfirmedOrder[]
  isEmpty: boolean
}) {
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)

  const totalRevenue = useMemo(
    () => orders.reduce((sum, order) => sum + order.totalPrice, 0),
    [orders],
  )

  if (isEmpty) {
    return (
      <div className="panel order-history-panel">
        <h3 className="order-history-title">Order History</h3>
        <div className="order-history-empty">
          <div className="order-history-empty-title">No orders yet</div>
          <div className="order-history-empty-copy">Confirmed orders will appear here</div>
        </div>
      </div>
    )
  }

  return (
    <div className="panel order-history-panel">
      <h3 className="order-history-title">Order History</h3>

      <div className="order-history-revenue">
        <div className="order-history-revenue-label">Total Revenue</div>
        <div className="order-history-revenue-value">{formatCurrency(totalRevenue)}</div>
      </div>

      <div className="order-history-list-shell">
        <div className="order-history-list">
          {orders.map((order) => (
            <div key={order.id} className="order-history-card">
              <div
                onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                className="order-history-row"
              >
                <div className="order-history-main">
                  <div className="order-history-name">
                    {order.orderNo ? `${order.orderNo} • ${order.productName}` : order.productName}
                  </div>
                  <div className="order-history-time">
                    {new Date(order.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                <div className="order-history-qty">
                  Qty: <strong>{order.quantity}</strong>
                </div>
                <div className="order-history-price">
                  {formatCurrency(order.totalPrice)}
                </div>
                <div className="order-history-status">
                  <span
                    className={`order-history-badge ${
                      order.status === 'CANCELLED'
                        ? 'order-history-badge--cancelled'
                        : order.productType === 'raw'
                          ? 'order-history-badge--raw'
                          : 'order-history-badge--non-raw'
                    }`}
                  >
                    {order.status === 'CANCELLED'
                      ? 'CANCELLED'
                      : order.productType === 'raw'
                        ? 'RAW'
                        : 'NON-RAW'}
                  </span>
                </div>
                <div className="order-history-toggle">
                  <span className="order-history-toggle-icon">
                    {expandedOrderId === order.id ? '▼' : '▶'}
                  </span>
                </div>
              </div>

              {expandedOrderId === order.id ? (
                <div className="order-history-detail">
                  <div className="order-history-detail-label">Ingredient Deductions</div>
                  {order.deductions.length === 0 ? (
                    <div className="order-history-detail-empty">
                      No recipe-linked ingredient deductions available for this order.
                    </div>
                  ) : (
                    <div className="order-history-deductions">
                      {order.deductions.map((ded, idx) => (
                        <div key={idx} className="order-history-deduction-row">
                          <div>{ded.ingredientName}</div>
                          <div className="order-history-deduction-qty">
                            -{ded.qty}
                            {ded.unit}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default OrderHistoryPanel
