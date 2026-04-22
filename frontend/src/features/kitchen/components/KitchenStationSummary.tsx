import type { KitchenStation } from '../../pos/pos.types'
import { stationOrder } from '../kitchen.logic'
import { getKitchenStationLabel } from '../kitchen.utils'

type KitchenStationSummaryProps = {
  stationSummary: Map<KitchenStation, number>
}

function KitchenStationSummary({ stationSummary }: KitchenStationSummaryProps) {
  return (
    <div className="panel kds-station-summary">
      <span className="muted">Station Load</span>
      <div className="kds-station-chips">
        {stationOrder.map((station) => {
          const count = stationSummary.get(station) ?? 0
          return (
            <span key={station} className={`station-chip station-${station.toLowerCase()}`}>
              {getKitchenStationLabel(station)} · {count}
            </span>
          )
        })}
      </div>
    </div>
  )
}

export default KitchenStationSummary
