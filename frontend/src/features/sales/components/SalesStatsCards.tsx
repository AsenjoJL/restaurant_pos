import AdminStatCard from '../../admin/components/AdminStatCard'

type SalesMetrics = {
  totalSales: number
  totalOrders: number
  profit: number
  avgTicket: number
  totalsByMethod: {
    CASH: number
    CARD: number
    GCASH: number
    OTHER: number
  }
}

type SalesStatsCardsProps = {
  metrics: SalesMetrics
  formatCurrency: (value: number) => string
}

function SalesStatsCards({ metrics, formatCurrency }: SalesStatsCardsProps) {
  return (
    <div className="admin-stats">
      <AdminStatCard label="Total Sales" value={formatCurrency(metrics.totalSales)} icon="/sales.png" />
      <AdminStatCard label="Total Orders" value={String(metrics.totalOrders)} icon="/total orders.png" />
      <AdminStatCard label="Profit" value={formatCurrency(metrics.profit)} icon="/profit.png" />
      <AdminStatCard label="Average Ticket" value={formatCurrency(metrics.avgTicket)} icon="/ticket.png" />
      <div className="panel admin-stat-card sales-payment-breakdown">
        <span className="stat-icon" aria-hidden="true">
          <img className="admin-stat-icon-img" src="/pay.png" alt="" />
        </span>
        <span className="muted">Payment Breakdown</span>
        <div className="sales-payment-lines">
          <p>
            Cash: <strong>{formatCurrency(metrics.totalsByMethod.CASH)}</strong>
          </p>
          <p>
            GCash: <strong>{formatCurrency(metrics.totalsByMethod.GCASH)}</strong>
          </p>
          <p>
            Card: <strong>{formatCurrency(metrics.totalsByMethod.CARD)}</strong>
          </p>
        </div>
      </div>
    </div>
  )
}

export default SalesStatsCards
