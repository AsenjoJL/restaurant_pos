import { formatDuration } from '../kitchen.logic'
import {
  getKitchenBoardItemCount,
  getKitchenBoardOrderTypeLabel,
  getKitchenBoardStations,
  getKitchenBoardStatusLabel,
  getKitchenBoardWaitLabel,
} from '../kitchen.board'
import { getKitchenStationLabel } from '../kitchen.utils'
import type { Order } from '../../../shared/types/order'

type KitchenQueueBoardCardProps = {
  kind: 'preparing' | 'ready'
  order: Order
}

function KitchenQueueBoardCard({ kind, order }: KitchenQueueBoardCardProps) {
  const elapsed = getKitchenBoardWaitLabel(order)
  const stations = getKitchenBoardStations(order)
  const statusClass = order.status.toLowerCase().replace(/_/g, '-')

  return (
    <article
      className={`kds-board-card ${
        kind === 'ready' ? 'kds-board-card--ready' : `kds-board-card--${statusClass}`
      }`}
    >
      <div className="kds-board-card-top">
        <span
          className={`kds-board-status ${
            kind === 'ready' ? 'kds-board-status--ready-for-pickup' : `kds-board-status--${statusClass}`
          }`}
        >
          {kind === 'ready' ? 'Ready' : getKitchenBoardStatusLabel(order.status)}
        </span>
        <div className="kds-board-stations" aria-label="Stations">
          {stations.map((station) => (
            <span
              key={`${order.id}-${station}`}
              className={`kds-board-station-dot station-${station.toLowerCase()}`}
              title={getKitchenStationLabel(station)}
              aria-label={getKitchenStationLabel(station)}
            />
          ))}
        </div>
      </div>
      <h3>{order.order_no}</h3>
      <div className="kds-board-card-meta">
        <span>{getKitchenBoardOrderTypeLabel(order)}</span>
        <span>{getKitchenBoardItemCount(order)} items</span>
      </div>
      <div className={`kds-board-wait${kind === 'preparing' && elapsed.isOverSla ? ' is-urgent' : ''}`}>
        <span>{kind === 'ready' ? 'Ready' : 'Wait'}</span>
        <strong>{formatDuration(elapsed.elapsedMs)}</strong>
      </div>
    </article>
  )
}

export default KitchenQueueBoardCard
