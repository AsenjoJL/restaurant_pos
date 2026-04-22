import { formatCurrency } from '../../../shared/lib/format'

type AdminTrendChartProps = {
  peakKey: string
  trend: {
    areaPath: string
    chartHeight: number
    chartMax: number
    chartPadding: {
      bottom: number
      top: number
    }
    linePath: string
    rows: Array<{
      key: string
      label: string
      total: number
      x: number
      y: number
    }>
  }
}

function AdminTrendChart({ peakKey, trend }: AdminTrendChartProps) {
  return (
    <div className="admin-trend-chart-card">
      <div className="admin-trend-chart-head">
        <h4>Daily Revenue Chart</h4>
        <div className="admin-trend-legend">
          <span>
            <i className="dot sales" /> Sales
          </span>
          <span>
            <i className="dot peak" /> Peak
          </span>
        </div>
      </div>

      <svg className="admin-sparkline" viewBox="0 0 760 280" preserveAspectRatio="none">
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y =
            trend.chartHeight -
            trend.chartPadding.bottom -
            ratio * (trend.chartHeight - trend.chartPadding.top - trend.chartPadding.bottom)
          return (
            <g key={ratio}>
              <line className="admin-sparkline-grid" x1={56} y1={y} x2={736} y2={y} />
              <text className="admin-sparkline-axis" x={8} y={y + 4}>
                {formatCurrency(trend.chartMax * ratio)}
              </text>
            </g>
          )
        })}
        <path className="admin-sparkline-area" d={trend.areaPath} />
        <path className="admin-sparkline-path" d={trend.linePath} />
        {trend.rows.map((row) => {
          const isPeak = peakKey.length > 0 && `${row.label}-${row.total}` === peakKey
          return (
            <circle
              key={row.key}
              cx={row.x}
              cy={row.y}
              r={isPeak ? 6.6 : 4.2}
              className={
                isPeak
                  ? 'admin-sparkline-point admin-sparkline-point--peak'
                  : 'admin-sparkline-point'
              }
            />
          )
        })}
        {trend.rows.map((row) => (
          <text key={`${row.key}-x`} className="admin-sparkline-axis x" x={row.x} y={270}>
            {row.label}
          </text>
        ))}
      </svg>
    </div>
  )
}

export default AdminTrendChart
