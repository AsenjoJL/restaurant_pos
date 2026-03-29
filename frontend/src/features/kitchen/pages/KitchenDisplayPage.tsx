import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../app/store/hooks'
import { getLiveSyncPollingOptions } from '../../../app/config/live-sync'
import { selectAdminSettings } from '../../admin/admin.selectors'
import { selectAuthUser } from '../../auth/auth.selectors'
import Badge from '../../../shared/components/ui/Badge'
import Button from '../../../shared/components/ui/Button'
import { useLiveSyncPolling } from '../../../shared/hooks/useLiveSyncPolling'
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
  syncKitchenOrderStatus,
  syncKitchenReplacementStatus,
  hydrateKitchenQueueFromRepository,
  markReplacementReady,
} from '../../orders/orders.store'
import type { OrderStatus } from '../../../shared/types/order'
import type { KitchenStation } from '../../pos/pos.types'
import { DATA_MODE } from '../../../app/config/data-mode'
import { getKitchenStationLabel, resolveKitchenStation } from '../kitchen.utils'
import {
  formatOverrideRemaining,
  getAdminOverrideRemainingMs,
  isAdminOverrideActive,
  setAdminOverride,
} from '../../../shared/lib/admin-override'
import {
  buildOrderStationCountMap,
  buildReplacementStationCountMap,
  createEmptyStationCounts,
  buildStationSummary,
  countReplacementItems,
  formatDuration,
  getKitchenMetrics,
  getOrderElapsed,
  getReplacementElapsed,
  stationOrder,
} from '../kitchen.logic'

const EMPTY_STATION_COUNTS = createEmptyStationCounts()

function KitchenDisplayPage() {
  const dispatch = useAppDispatch()
  const orders = useAppSelector(selectOrders)
  const replacementTickets = useAppSelector(selectReplacementTickets)
  const settings = useAppSelector(selectAdminSettings)
  const user = useAppSelector(selectAuthUser)
  const role = user?.role
  const isAdmin = role === 'admin'
  const [adminOverride, setAdminOverrideState] = useState(() =>
    isAdminOverrideActive('kitchen'),
  )
  const [overrideRemainingMs, setOverrideRemainingMs] = useState(() =>
    getAdminOverrideRemainingMs('kitchen'),
  )
  const canOperateKitchen = role === 'kitchen' || (isAdmin && adminOverride)
  const [activeStation, setActiveStation] = useState<KitchenStation | 'ALL'>('ALL')

  useEffect(() => {
    if (!isAdmin) {
      return
    }
    const sync = () => {
      setAdminOverrideState(isAdminOverrideActive('kitchen'))
      setOverrideRemainingMs(getAdminOverrideRemainingMs('kitchen'))
    }
    sync()
    const timer = window.setInterval(sync, 1000)
    return () => window.clearInterval(timer)
  }, [isAdmin])

  const syncKitchenQueue = useCallback(() => {
    void dispatch(hydrateKitchenQueueFromRepository())
  }, [dispatch])

  useLiveSyncPolling({
    enabled: DATA_MODE === 'api',
    sync: syncKitchenQueue,
    ...getLiveSyncPollingOptions('kitchenQueue', settings.liveSync),
  })

  const kitchenOrders = useMemo(
    () => orders.filter((order) => isKitchenStatus(order.status)),
    [orders],
  )

  const metrics = useMemo(() => getKitchenMetrics(orders, kitchenOrders), [kitchenOrders, orders])

  const orderStationCountMap = useMemo(
    () => buildOrderStationCountMap(kitchenOrders),
    [kitchenOrders],
  )
  const replacementStationCountMap = useMemo(
    () => buildReplacementStationCountMap(replacementTickets),
    [replacementTickets],
  )

  const stationSummary = useMemo(
    () => buildStationSummary(orderStationCountMap, replacementStationCountMap),
    [orderStationCountMap, replacementStationCountMap],
  )

  const filteredOrders = useMemo(() => {
    if (activeStation === 'ALL') {
      return kitchenOrders
    }
    return kitchenOrders.filter((order) => {
      const counts = orderStationCountMap.get(order.id)
      if (!counts) {
        return false
      }
      return (counts.get(activeStation) ?? 0) > 0
    })
  }, [activeStation, kitchenOrders, orderStationCountMap])

  const filteredTickets = useMemo(() => {
    if (activeStation === 'ALL') {
      return replacementTickets
    }
    return replacementTickets.filter((ticket) => {
      const counts = replacementStationCountMap.get(ticket.id)
      if (!counts) {
        return false
      }
      return (counts.get(activeStation) ?? 0) > 0
    })
  }, [activeStation, replacementStationCountMap, replacementTickets])

  const handleStartOrder = (id: string) => {
    dispatch(startPreparing({ id }))
    void dispatch(syncKitchenOrderStatus({ id, status: 'PREPARING' }))
  }

  const handleReadyOrder = (id: string) => {
    dispatch(markReady({ id }))
    void dispatch(syncKitchenOrderStatus({ id, status: 'READY_FOR_PICKUP' }))
  }

  const handleStartReplacement = (id: string) => {
    dispatch(startReplacementTicket({ id }))
    void dispatch(syncKitchenReplacementStatus({ id, status: 'PREPARING' }))
  }

  const handleReadyReplacement = (id: string) => {
    dispatch(markReplacementReady({ id }))
    void dispatch(syncKitchenReplacementStatus({ id, status: 'READY_FOR_PICKUP' }))
  }

  const handleToggleAdminOverride = () => {
    const next = !adminOverride
    setAdminOverride('kitchen', next)
    setAdminOverrideState(next)
    setOverrideRemainingMs(next ? getAdminOverrideRemainingMs('kitchen') : 0)
  }

  return (
    <div className="page kitchen-page">
      <div className="page-header">
        <div>
          <h2>Kitchen Display</h2>
          <p className="muted">
            SENT_TO_KITCHEN+ orders from kiosk and staff.
            {isAdmin && !adminOverride ? ' Admin is currently view-only.' : ''}
          </p>
        </div>
        <div className="admin-row-actions">
          <Button
            variant="outline"
            onClick={() => window.open('/KDS', '_blank', 'noopener,noreferrer')}
            icon="cast"
          >
            Open Customer Board
          </Button>
          {isAdmin ? (
            <Button
              variant={adminOverride ? 'primary' : 'outline'}
              onClick={handleToggleAdminOverride}
              icon="admin_panel_settings"
            >
              {adminOverride
                ? `Override ON ${formatOverrideRemaining(overrideRemainingMs)}`
                : 'Enable Override'}
            </Button>
          ) : null}
        </div>
      </div>

      <div className="kds-metrics">
        <div className="panel kds-metric">
          <span className="muted">In Progress</span>
          <strong>{metrics.inProgress}</strong>
        </div>
        <div className="panel kds-metric">
          <span className="muted">Over SLA</span>
          <strong>{metrics.overdue}</strong>
        </div>
        <div className="panel kds-metric">
          <span className="muted">Avg Prep</span>
          <strong>{metrics.avgPrepMs ? formatDuration(metrics.avgPrepMs) : '—'}</strong>
        </div>
        <div className="panel kds-metric">
          <span className="muted">Orders / hr</span>
          <strong>{metrics.completedLastHour}</strong>
        </div>
      </div>

      <div className="panel kds-station-summary">
        <span className="muted">Station Load</span>
        <div className="kds-station-chips">
          {stationOrder.map((station) => {
            const count = stationSummary.get(station) ?? 0
            return (
              <span
                key={station}
                className={`station-chip station-${station.toLowerCase()}`}
              >
                {getKitchenStationLabel(station)} · {count}
              </span>
            )
          })}
        </div>
      </div>

      <div className="kds-filter">
        <span className="muted">Filter</span>
        <div className="kds-filter-buttons">
          <button
            type="button"
            className={`kds-filter-btn${activeStation === 'ALL' ? ' is-active' : ''}`}
            onClick={() => setActiveStation('ALL')}
          >
            All Stations
          </button>
          {stationOrder.map((station) => (
            <button
              key={station}
              type="button"
              className={`kds-filter-btn station-${station.toLowerCase()}${
                activeStation === station ? ' is-active' : ''
              }`}
              onClick={() => setActiveStation(station)}
            >
              {getKitchenStationLabel(station)}
            </button>
          ))}
        </div>
      </div>

      <div className="kds-grid">
        {filteredOrders.map((order) => {
          const { elapsedLabel, elapsedMs, isOverSla } = getOrderElapsed(order)
          const stationCounts = orderStationCountMap.get(order.id) ?? EMPTY_STATION_COUNTS

          return (
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
                <span className={`kds-timer${isOverSla ? ' is-overdue' : ''}`}>
                  {elapsedLabel}: {formatDuration(elapsedMs)}
                </span>
              </div>
              <div className="kds-stations">
                {stationOrder.map((station) => {
                  const count = stationCounts.get(station) ?? 0
                  if (count === 0) {
                    return null
                  }
                  return (
                    <span
                      key={`${order.id}-${station}`}
                      className={`station-chip station-${station.toLowerCase()}`}
                    >
                      {getKitchenStationLabel(station)} · {count}
                    </span>
                  )
                })}
              </div>
              <div className="kds-items">
                {order.items.map((item) => {
                  const station = resolveKitchenStation(item.id)
                  return (
                    <div key={`${order.id}-${item.id}`} className="kds-item-row">
                      <div>
                        <div className="kds-item-title">
                          <strong>{item.name}</strong>
                          <span
                            className={`station-pill station-${station.toLowerCase()}`}
                          >
                            {getKitchenStationLabel(station)}
                          </span>
                        </div>
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
                  )
                })}
              </div>
              <div className="kds-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => handleStartOrder(order.id)}
                  disabled={order.status !== 'SENT_TO_KITCHEN' || !canOperateKitchen}
                >
                  Start
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleReadyOrder(order.id)}
                  disabled={order.status !== 'PREPARING' || !canOperateKitchen}
                >
                  Ready
                </button>
              </div>
            </div>
          )
        })}
        {filteredTickets.map((ticket) => {
          const { elapsedLabel, elapsedMs, isOverSla } = getReplacementElapsed(ticket)
          const stationCounts =
            replacementStationCountMap.get(ticket.id) ?? EMPTY_STATION_COUNTS

          return (
            <div key={ticket.id} className="kds-card panel kds-replacement">
              <div className="kds-header">
                <div>
                  <h3>{ticket.orderNo}</h3>
                  <p className="muted">REMAKE / REPLACEMENT</p>
                </div>
                <Badge variant={ticket.status as OrderStatus} icon="refresh">
                  {getKitchenStatusLabel(ticket.status as OrderStatus)}
                </Badge>
              </div>
              <div className="kds-meta">
                <span>{countReplacementItems(ticket.items)} items</span>
                <span className="chip">Replacement</span>
                <span className={`kds-timer${isOverSla ? ' is-overdue' : ''}`}>
                  {elapsedLabel}: {formatDuration(elapsedMs)}
                </span>
              </div>
              <div className="kds-stations">
                {stationOrder.map((station) => {
                  const count = stationCounts.get(station) ?? 0
                  if (count === 0) {
                    return null
                  }
                  return (
                    <span
                      key={`${ticket.id}-${station}`}
                      className={`station-chip station-${station.toLowerCase()}`}
                    >
                      {getKitchenStationLabel(station)} · {count}
                    </span>
                  )
                })}
              </div>
              <div className="kds-items">
                {ticket.items.map((item) => {
                  const station = resolveKitchenStation(item.productId)
                  return (
                    <div key={`${ticket.id}-${item.productId}`} className="kds-item-row">
                      <div>
                        <div className="kds-item-title">
                          <strong>{item.name}</strong>
                          <span
                            className={`station-pill station-${station.toLowerCase()}`}
                          >
                            {getKitchenStationLabel(station)}
                          </span>
                        </div>
                        <span className="muted">Qty {item.qty}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="kds-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => handleStartReplacement(ticket.id)}
                  disabled={ticket.status !== 'SENT_TO_KITCHEN' || !canOperateKitchen}
                >
                  Start
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleReadyReplacement(ticket.id)}
                  disabled={ticket.status !== 'PREPARING' || !canOperateKitchen}
                >
                  Ready
                </button>
              </div>
            </div>
          )
        })}
        {filteredOrders.length === 0 && filteredTickets.length === 0 ? (
          <div className="panel empty-state">
            <h3>No kitchen tickets yet</h3>
            <p className="muted">
              {activeStation === 'ALL'
                ? 'Paid orders will appear here once sent to the kitchen.'
                : 'No tickets for this station yet.'}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default KitchenDisplayPage
