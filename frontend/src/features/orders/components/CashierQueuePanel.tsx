import { formatCurrency } from '../../../shared/lib/format'
import { getItemCount } from '../../../shared/lib/orders'
import { getCashierHeaderLabel, type CashierTab } from '../cashier.logic'
import type { Order } from '../../../shared/types/order'
import CashierOrderBadges from './CashierOrderBadges'
import { getCashierOrderTypeLabel } from '../cashier.utils'

type CashierQueuePanelProps = {
  orders: Order[]
  selectedOrderId: string | null
  tab: CashierTab
  onSelectOrder: (orderId: string) => void
}

function CashierQueuePanel({
  orders,
  selectedOrderId,
  tab,
  onSelectOrder,
}: CashierQueuePanelProps) {
  return (
    <div className="panel cashier-queue">
      <div className="cashier-queue-header">
        <h3>{getCashierHeaderLabel(tab)}</h3>
        <span className="muted">{orders.length} orders</span>
      </div>
      <div className="cashier-list">
        {orders.map((order) => (
          <button
            key={order.id}
            type="button"
            className={`cashier-card${selectedOrderId === order.id ? ' is-active' : ''}`}
            onClick={() => onSelectOrder(order.id)}
          >
            <div className="cashier-card-head">
              <div className="cashier-card-copy">
                <h3>{order.order_no}</h3>
                <p className="muted">{getCashierOrderTypeLabel(order)}</p>
              </div>
              <CashierOrderBadges order={order} replacementStatus={order.replacementStatus} />
            </div>
            <div className="cashier-card-meta">
              <span>{getItemCount(order.items)} items</span>
              <span className="cashier-card-total">{formatCurrency(order.total)}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default CashierQueuePanel
