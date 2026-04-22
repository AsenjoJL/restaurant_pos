import { KITCHEN_ALL_STATIONS, type KitchenStationFilter } from '../kitchen.constants'
import { stationOrder } from '../kitchen.logic'
import { getKitchenStationLabel } from '../kitchen.utils'

type KitchenStationFilterBarProps = {
  activeStation: KitchenStationFilter
  onSelectStation: (station: KitchenStationFilter) => void
}

function KitchenStationFilterBar({
  activeStation,
  onSelectStation,
}: KitchenStationFilterBarProps) {
  return (
    <div className="kds-filter">
      <span className="muted">Filter</span>
      <div className="kds-filter-buttons">
        <button
          type="button"
          className={`kds-filter-btn${activeStation === KITCHEN_ALL_STATIONS ? ' is-active' : ''}`}
          onClick={() => onSelectStation(KITCHEN_ALL_STATIONS)}
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
            onClick={() => onSelectStation(station)}
          >
            {getKitchenStationLabel(station)}
          </button>
        ))}
      </div>
    </div>
  )
}

export default KitchenStationFilterBar
