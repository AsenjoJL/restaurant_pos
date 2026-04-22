import { formatCurrency } from '../../../shared/lib/format'

type AdminTrendSummaryProps = {
  trend: {
    changePct: number | null
    dailyAverageActive: number
    peak: { label: string; total: number } | null
    rangeLabel: string
    windowTotal: number
  }
}

function AdminTrendSummary({ trend }: AdminTrendSummaryProps) {
  return (
    <div className="admin-trend-kpis">
      <div className="admin-trend-kpi-card">
        <span>Total Sales</span>
        <strong>{formatCurrency(trend.windowTotal)}</strong>
        <p className="muted">{trend.rangeLabel}</p>
      </div>
      <div className="admin-trend-kpi-card">
        <span>Daily Average</span>
        <strong>{formatCurrency(trend.dailyAverageActive)}</strong>
        <p className="muted">per active day</p>
      </div>
      <div className="admin-trend-kpi-card">
        <span>Peak Day</span>
        <strong>{trend.peak ? formatCurrency(trend.peak.total) : formatCurrency(0)}</strong>
        <p className="muted">{trend.peak?.label ?? 'No peak yet'}</p>
      </div>
      <div className="admin-trend-kpi-card">
        <span>vs Prev Period</span>
        <strong
          className={
            trend.changePct === null ? '' : trend.changePct >= 0 ? 'kpi-positive' : 'kpi-negative'
          }
        >
          {trend.changePct === null
            ? 'N/A'
            : `${trend.changePct >= 0 ? '+' : ''}${trend.changePct.toFixed(1)}%`}
        </strong>
        <p className="muted">
          {trend.changePct === null
            ? 'No previous period baseline'
            : trend.changePct >= 0
              ? 'trending up'
              : 'trending down'}
        </p>
      </div>
    </div>
  )
}

export default AdminTrendSummary
