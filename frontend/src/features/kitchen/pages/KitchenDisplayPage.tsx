import { useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '../../../app/store/hooks'
import Badge from '../../../shared/components/ui/Badge'
import {
  formatEnumLabel,
  getItemCount,
  getKitchenStatusLabel,
  isKitchenStatus,
} from '../../../shared/lib/orders'
import { selectOrders, selectReplacementTickets } from '../../orders/orders.selectors'
import {
  markReady,
  startPreparing,
  startReplacementTicket,
  markReplacementReady,
} from '../../orders/orders.store'
import type { OrderStatus } from '../../../shared/types/order'

function KitchenDisplayPage() {
  const dispatch = useAppDispatch()
  const orders = useAppSelector(selectOrders)
  const replacementTickets = useAppSelector(selectReplacementTickets)

  const kitchenOrders = useMemo(
    () => orders.filter((order) => isKitchenStatus(order.status)),
    [orders],
  )

  return (
    <div className="page">
      <div className="page-header">
        <h2>Kitchen Display</h2>
        <p className="muted">SENT_TO_KITCHEN+ orders from kiosk and staff.</p>
      </div>
      <div className="kds-grid">
        {kitchenOrders.map((order) => (
          <div key={order.id} className="kds-card panel">
            <div className="kds-header">
              <div>
                <h3>{order.order_no}</h3>
                <p className="muted">
                  {order.order_type === 'DINE_IN'
                    ? order.table ?? 'Dine-in'
                    : formatEnumLabel(order.order_type)}
                </p>
              </div>
              <Badge variant={order.status}>{getKitchenStatusLabel(order.status)}</Badge>
            </div>
            <div className="kds-meta">
              <span>{getItemCount(order.items)} items</span>
              <span className={`chip chip-${order.source.toLowerCase()}`}>
                {formatEnumLabel(order.source)}
              </span>
            </div>
            <div className="kds-items">
              {order.items.map((item) => (
                <div key={`${order.id}-${item.id}`} className="kds-item-row">
                  <div>
                    <strong>{item.name}</strong>
                    <span className="muted">Qty {item.quantity}</span>
                    {item.bundle_items?.length ? (
                      <div className="kds-bundle">
                        {item.bundle_items.map((bundleItem) => (
                          <span key={`${item.id}-${bundleItem.id}`}>
                            {bundleItem.quantity}× {bundleItem.name}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    {item.modifiers?.length ? (
                      <div className="muted">{item.modifiers.join(', ')}</div>
                    ) : null}
                    {item.note ? <div className="muted">Note: {item.note}</div> : null}
                  </div>
                </div>
              ))}
            </div>
            <div className="kds-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => dispatch(startPreparing({ id: order.id }))}
                disabled={order.status !== 'SENT_TO_KITCHEN'}
              >
                Start
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => dispatch(markReady({ id: order.id }))}
                disabled={order.status !== 'PREPARING'}
              >
                Ready
              </button>
            </div>
          </div>
        ))}
        {replacementTickets.map((ticket) => (
          <div key={ticket.id} className="kds-card panel kds-replacement">
            <div className="kds-header">
              <div>
                <h3>{ticket.orderNo}</h3>
                <p className="muted">REMAKE / REPLACEMENT</p>
              </div>
              <Badge
                variant={ticket.status as OrderStatus}
                icon="refresh"
              >
                {getKitchenStatusLabel(ticket.status as OrderStatus)}
              </Badge>
            </div>
            <div className="kds-meta">
              <span>
                {ticket.items.reduce((sum, item) => sum + item.qty, 0)} items
              </span>
              <span className="chip">Replacement</span>
            </div>
            <div className="kds-items">
              {ticket.items.map((item) => (
                <div key={`${ticket.id}-${item.productId}`} className="kds-item-row">
                  <div>
                    <strong>{item.name}</strong>
                    <span className="muted">Qty {item.qty}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="kds-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => dispatch(startReplacementTicket({ id: ticket.id }))}
                disabled={ticket.status !== 'SENT_TO_KITCHEN'}
              >
                Start
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => dispatch(markReplacementReady({ id: ticket.id }))}
                disabled={ticket.status !== 'PREPARING'}
              >
                Ready
              </button>
            </div>
          </div>
        ))}
        {kitchenOrders.length === 0 && replacementTickets.length === 0 ? (
          <div className="panel empty-state">
            <h3>No kitchen tickets yet</h3>
            <p className="muted">Paid orders will appear here once sent to the kitchen.</p>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default KitchenDisplayPage
