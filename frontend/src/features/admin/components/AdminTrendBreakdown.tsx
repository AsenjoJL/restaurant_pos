import { formatCurrency } from '../../../shared/lib/format'
import type { TrendRange } from '../admin.dashboard-metrics'

type AdminTrendBreakdownProps = {
  trend: {
    rows: Array<{
      dayLabel: string
      key: string
      label: string
      ratio: number
      status: string
      statusTone: string
      total: number
      txns: number
    }>
    windowTotal: number
  }
  trendRange: TrendRange
}

function AdminTrendBreakdown({ trend, trendRange }: AdminTrendBreakdownProps) {
  return (
    <div className="admin-trend-breakdown">
      <div className="admin-trend-breakdown-head">
        <h4>Per Date Breakdown</h4>
        <span>
          {trendRange === '12M' ? '12 months' : trendRange === '30D' ? '30 days' : '7 days'}
        </span>
      </div>
      <div className="admin-trend-table">
        <div className="admin-trend-row head">
          <span>Date</span>
          <span>Day</span>
          <span>Sales (₱)</span>
          <span>Transactions</span>
          <span>Performance</span>
          <span>Status</span>
        </div>
        {trend.rows.map((row) => (
          <div key={row.key} className="admin-trend-row">
            <span>{row.label}</span>
            <span>{row.dayLabel}</span>
            <strong>{row.total > 0 ? formatCurrency(row.total) : '—'}</strong>
            <span>{row.txns > 0 ? `${row.txns} txns` : '—'}</span>
            <span className="admin-trend-progress">
              <i style={{ width: `${Math.max(6, row.ratio * 100)}%` }} />
            </span>
            <span className={`admin-trend-status admin-trend-status--${row.statusTone}`}>
              {row.status}
            </span>
          </div>
        ))}
        <div className="admin-trend-row foot">
          <span>{trendRange === '12M' ? '12-MONTH TOTAL' : `${trendRange} TOTAL`}</span>
          <span />
          <strong>{formatCurrency(trend.windowTotal)}</strong>
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  )
}

export default AdminTrendBreakdown
