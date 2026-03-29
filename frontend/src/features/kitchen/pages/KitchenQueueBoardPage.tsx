import { useCallback, useEffect, useMemo, useState } from 'react'
import { DATA_MODE } from '../../../app/config/data-mode'
import { getLiveSyncPollingOptions } from '../../../app/config/live-sync'
import { useAppDispatch, useAppSelector } from '../../../app/store/hooks'
import { selectAdminSettings } from '../../admin/admin.selectors'
import { selectOrders } from '../../orders/orders.selectors'
import { hydrateKitchenQueueFromRepository } from '../../orders/orders.store'
import { useLiveSyncPolling } from '../../../shared/hooks/useLiveSyncPolling'
import { formatEnumLabel } from '../../../shared/lib/orders'

function KitchenQueueBoardPage() {
  const dispatch = useAppDispatch()
  const settings = useAppSelector(selectAdminSettings)
  const orders = useAppSelector(selectOrders)
  const [now, setNow] = useState(() => new Date())

  const syncKitchenQueue = useCallback(() => {
    void dispatch(hydrateKitchenQueueFromRepository())
  }, [dispatch])

  useLiveSyncPolling({
    enabled: DATA_MODE === 'api',
    sync: syncKitchenQueue,
    ...getLiveSyncPollingOptions('kitchenQueue', settings.liveSync),
  })

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const preparingOrders = useMemo(
    () =>
      orders.filter(
        (order) => order.status === 'SENT_TO_KITCHEN' || order.status === 'PREPARING',
      ),
    [orders],
  )

  const readyOrders = useMemo(
    () => orders.filter((order) => order.status === 'READY_FOR_PICKUP'),
    [orders],
  )

  return (
    <div className="kds-board">
      <header className="kds-board-header">
        <div>
          <h1>Now Serving Board</h1>
          <p>Customer Display • Kitchen Queue</p>
        </div>
        <div className="kds-board-clock">
          <strong>{now.toLocaleTimeString()}</strong>
          <span>{now.toLocaleDateString()}</span>
        </div>
      </header>

      <div className="kds-board-columns">
        <section className="kds-board-column preparing">
          <div className="kds-board-column-head">
            <h2>Preparing</h2>
            <span>{preparingOrders.length}</span>
          </div>
          <div className="kds-board-list">
            {preparingOrders.length === 0 ? (
              <div className="kds-board-empty">No active prep orders</div>
            ) : (
              preparingOrders.map((order) => (
                <article key={order.id} className="kds-board-card">
                  <h3>{order.order_no}</h3>
                  <p>{formatEnumLabel(order.order_type)}</p>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="kds-board-column ready">
          <div className="kds-board-column-head">
            <h2>Ready for Serving</h2>
            <span>{readyOrders.length}</span>
          </div>
          <div className="kds-board-list">
            {readyOrders.length === 0 ? (
              <div className="kds-board-empty">No orders ready yet</div>
            ) : (
              readyOrders.map((order) => (
                <article key={order.id} className="kds-board-card ready">
                  <h3>{order.order_no}</h3>
                  <p>{formatEnumLabel(order.order_type)}</p>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

export default KitchenQueueBoardPage
