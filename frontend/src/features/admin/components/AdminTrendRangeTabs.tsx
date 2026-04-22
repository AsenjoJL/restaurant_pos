import { ADMIN_DASHBOARD_TREND_RANGES } from '../admin.constants'
import type { TrendRange } from '../admin.dashboard-metrics'

type AdminTrendRangeTabsProps = {
  onSelect: (range: TrendRange) => void
  value: TrendRange
}

function AdminTrendRangeTabs({ onSelect, value }: AdminTrendRangeTabsProps) {
  return (
    <div className="admin-chart-range" role="tablist" aria-label="Sales trend range">
      {ADMIN_DASHBOARD_TREND_RANGES.map((range) => (
        <button
          key={range}
          type="button"
          className={`admin-chart-range-btn${value === range ? ' is-active' : ''}`}
          onClick={() => onSelect(range)}
          aria-pressed={value === range}
        >
          {range}
        </button>
      ))}
    </div>
  )
}

export default AdminTrendRangeTabs
