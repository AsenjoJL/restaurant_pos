import { useState } from 'react'
import { formatCurrency } from '../../../shared/lib/format'

const CHART_WIDTH = 760
const CHART_HEIGHT = 280

type ChartTooltip = {
  amount: string
  label: string
  left: number
  top: number
}

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
  const [tooltip, setTooltip] = useState<ChartTooltip | null>(null)

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

      <div className="admin-trend-chart-plot">
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
            const amount = formatCurrency(row.total)
            const accessibleLabel = `${row.label}: ${amount}`
            const showTooltip = () =>
              setTooltip({
                amount,
                label: row.label,
                left: Math.min(92, Math.max(8, (row.x / CHART_WIDTH) * 100)),
                top: Math.min(92, Math.max(10, (row.y / CHART_HEIGHT) * 100)),
              })

            return (
              <g
                key={row.key}
                aria-label={accessibleLabel}
                className="admin-sparkline-point-group"
                tabIndex={0}
                onBlur={() => setTooltip(null)}
                onFocus={showTooltip}
                onPointerEnter={showTooltip}
                onPointerLeave={() => setTooltip(null)}
              >
                <title>{accessibleLabel}</title>
                <circle className="admin-sparkline-hit-target" cx={row.x} cy={row.y} r={14} />
                <circle
                  cx={row.x}
                  cy={row.y}
                  r={isPeak ? 6.6 : 4.2}
                  className={
                    isPeak
                      ? 'admin-sparkline-point admin-sparkline-point--peak'
                      : 'admin-sparkline-point'
                  }
                />
              </g>
            )
          })}
          {trend.rows.map((row) => (
            <text key={`${row.key}-x`} className="admin-sparkline-axis x" x={row.x} y={270}>
              {row.label}
            </text>
          ))}
        </svg>

        {tooltip ? (
          <div
            className="admin-trend-chart-tooltip"
            style={{ left: `${tooltip.left}%`, top: `${tooltip.top}%` }}
          >
            <span>{tooltip.label}</span>
            <strong>{tooltip.amount}</strong>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default AdminTrendChart
