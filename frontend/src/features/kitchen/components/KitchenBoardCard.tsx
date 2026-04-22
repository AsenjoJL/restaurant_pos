import { formatEnumLabel, getItemCount, getKitchenStatusLabel } from '../../../shared/lib/orders'
import type { Order, OrderStatus, ReplacementTicket } from '../../../shared/types/order'
import {
  countReplacementItems,
  formatDuration,
  getOrderElapsed,
  getReplacementElapsed,
} from '../kitchen.logic'
import { getKitchenStationLabel, resolveKitchenStation } from '../kitchen.utils'
import type { KitchenStation } from '../../pos/pos.types'

type KitchenBoardCardProps =
  | {
      kind: 'order'
      canOperateKitchen: boolean
      onReady: (id: string) => void
      onStart: (id: string) => void
      stationCounts: Map<KitchenStation, number>
      ticket: Order
    }
  | {
      kind: 'replacement'
      canOperateKitchen: boolean
      onReady: (id: string) => void
      onStart: (id: string) => void
      stationCounts: Map<KitchenStation, number>
      ticket: ReplacementTicket
    }

function getStatusClassName(status: OrderStatus | 'SENT_TO_KITCHEN') {
  return status.toLowerCase().replace(/_/g, '-')
}

function KitchenBoardCard(props: KitchenBoardCardProps) {
  const { canOperateKitchen, onReady, onStart, stationCounts } = props

  if (props.kind === 'replacement') {
    const ticket = props.ticket
    const elapsed = getReplacementElapsed(ticket)

    return (
      <div className={`kds-card panel kds-replacement kds-status-${ticket.status.toLowerCase().replace(/_/g, '-')}`}>
        <div className="kds-header">
          <div>
            <h3>{ticket.orderNo}</h3>
            <p className="muted">REMAKE / REPLACEMENT</p>
          </div>
          <span className={`kitchen-status-tag kitchen-status-tag--${getStatusClassName(ticket.status as OrderStatus)}`}>
            {getKitchenStatusLabel(ticket.status as OrderStatus)}
          </span>
        </div>
        <div className="kds-meta">
          <span>{countReplacementItems(ticket.items)} items</span>
          <span className="chip">Replacement</span>
          <span className={`kds-timer${elapsed.isOverSla ? ' is-overdue' : ''}`}>
            {elapsed.elapsedLabel}: {formatDuration(elapsed.elapsedMs)}
          </span>
        </div>
        <div className="kds-stations">
          {Array.from(stationCounts.entries()).map(([station, count]) =>
            count > 0 ? (
              <span key={`${ticket.id}-${station}`} className={`station-chip station-${station.toLowerCase()}`}>
                {getKitchenStationLabel(station)} · {count}
              </span>
            ) : null,
          )}
        </div>
        <div className="kds-items">
          {ticket.items.map((item) => {
            const station = resolveKitchenStation(item.productId)
            return (
              <div key={`${ticket.id}-${item.productId}`} className="kds-item-row">
                <div>
                  <div className="kds-item-title">
                    <strong>{item.name}</strong>
                    <span className={`station-pill station-${station.toLowerCase()}`}>
                      <span className={`station-dot station-${station.toLowerCase()}`} aria-hidden="true" />
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
            onClick={() => onStart(ticket.id)}
            disabled={ticket.status !== 'SENT_TO_KITCHEN' || !canOperateKitchen}
          >
            START
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onReady(ticket.id)}
            disabled={ticket.status !== 'PREPARING' || !canOperateKitchen}
          >
            READY
          </button>
        </div>
      </div>
    )
  }

  const ticket = props.ticket
  const elapsed = getOrderElapsed(ticket)

  return (
    <div className={`kds-card panel kds-status-${ticket.status.toLowerCase().replace(/_/g, '-')}`}>
      <div className="kds-header">
        <div>
          <h3>{ticket.order_no}</h3>
          <p className="muted">
            {ticket.order_type === 'DINE_IN'
              ? ticket.table ?? 'Dine-in'
              : formatEnumLabel(ticket.order_type)}
          </p>
        </div>
        <span className={`kitchen-status-tag kitchen-status-tag--${getStatusClassName(ticket.status as OrderStatus)}`}>
          {getKitchenStatusLabel(ticket.status as OrderStatus)}
        </span>
      </div>
      <div className="kds-meta">
        <span>{getItemCount(ticket.items)} items</span>
        <span className={`chip chip-${ticket.source.toLowerCase()}`}>
          {formatEnumLabel(ticket.source)}
        </span>
        <span className={`kds-timer${elapsed.isOverSla ? ' is-overdue' : ''}`}>
          {elapsed.elapsedLabel}: {formatDuration(elapsed.elapsedMs)}
        </span>
      </div>
      <div className="kds-stations">
        {Array.from(stationCounts.entries()).map(([station, count]) =>
          count > 0 ? (
            <span key={`${ticket.id}-${station}`} className={`station-chip station-${station.toLowerCase()}`}>
              {getKitchenStationLabel(station as ReturnType<typeof resolveKitchenStation>)} · {count}
            </span>
          ) : null,
        )}
      </div>
      <div className="kds-items">
        {ticket.items.map((item) => {
          const station = resolveKitchenStation(item.id)
          return (
            <div key={`${ticket.id}-${item.id}`} className="kds-item-row">
              <div>
                <div className="kds-item-title">
                  <strong>{item.name}</strong>
                  <span className={`station-pill station-${station.toLowerCase()}`}>
                    <span className={`station-dot station-${station.toLowerCase()}`} aria-hidden="true" />
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
                {item.modifiers?.length ? <div className="muted">{item.modifiers.join(', ')}</div> : null}
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
          onClick={() => onStart(ticket.id)}
          disabled={ticket.status !== 'SENT_TO_KITCHEN' || !canOperateKitchen}
        >
          START
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => onReady(ticket.id)}
          disabled={ticket.status !== 'PREPARING' || !canOperateKitchen}
        >
          READY
        </button>
      </div>
    </div>
  )
}

export default KitchenBoardCard
