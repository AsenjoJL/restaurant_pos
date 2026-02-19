import { useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '../../../app/store/hooks'
import Badge from '../../../shared/components/ui/Badge'
import {
  formatEnumLabel,
  getItemCount,
  getKitchenStatusLabel,
  isKitchenStatus,
} from '../../../shared/lib/orders'
import { selectOrders } from '../../orders/orders.selectors'
import { markReady, startPreparing } from '../../orders/orders.store'

function KitchenDisplayPage() {
  const dispatch = useAppDispatch()
  const orders = useAppSelector(selectOrders)

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
        {kitchenOrders.length === 0 ? (
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
