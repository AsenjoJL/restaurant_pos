import { formatDuration } from '../kitchen.logic'

type KitchenMetricsPanelProps = {
  metrics: {
    avgPrepMs: number
    completedLastHour: number
    inProgress: number
    overdue: number
  }
}

function KitchenMetricsPanel({ metrics }: KitchenMetricsPanelProps) {
  return (
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
  )
}

export default KitchenMetricsPanel
