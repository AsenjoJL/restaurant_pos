import { formatCurrency } from '../../../shared/lib/format'
import AdminStatCard from '../components/AdminStatCard'
import AdminTrendBreakdown from '../components/AdminTrendBreakdown'
import AdminTrendChart from '../components/AdminTrendChart'
import AdminTrendRangeTabs from '../components/AdminTrendRangeTabs'
import AdminTrendSummary from '../components/AdminTrendSummary'
import useAdminDashboardPageController from '../hooks/useAdminDashboardPageController'

function AdminDashboardPage() {
  const { analytics, peakKey, stats, trend, trendRange, setTrendRange } =
    useAdminDashboardPageController()

  return (
    <div className="page admin-page admin-dashboard-page">
      <div className="page-header">
        <div>
          <h2>Dashboard Overview</h2>
          <p className="muted">
            Real-time insights into your menu and staff performance.
          </p>
        </div>
      </div>

      <div className="admin-stats">
        <AdminStatCard
          label="Total Sales Today"
          value={formatCurrency(analytics.todaySales)}
          icon="/saless.webp"
        />
        <AdminStatCard
          label="Total Orders"
          value={String(analytics.totalOrders)}
          icon="/total orders.png"
        />
        <AdminStatCard
          label="Net Sales"
          value={formatCurrency(analytics.netSales)}
          icon="/net sales.png"
        />
        <AdminStatCard
          label="Estimated Profit"
          value={formatCurrency(analytics.profit)}
          icon="/profit.png"
        />
        <AdminStatCard
          label="Average Ticket"
          value={formatCurrency(analytics.avgTicket)}
          icon="/ticket.png"
        />
      </div>

      <div className="admin-stats">
        <AdminStatCard label="Total Staff" value={String(stats.staff)} icon="/staff.png" />
        <AdminStatCard
          label="Active Staff"
          value={String(stats.activeUsers)}
          icon="/staff.png"
        />
        <AdminStatCard
          label="Active Menu Items"
          value={String(stats.activeProducts)}
          helper="Visible on POS"
          icon="/menu.png"
        />
        <AdminStatCard
          label="Low / Out of Stock"
          value={`${analytics.lowStock} / ${analytics.outOfStock}`}
          helper="Monitor inventory risk"
          icon="/stock.jpg"
        />
      </div>

      <section className="admin-trend-suite">
        <div className="admin-trend-head">
          <div>
            <h3>SALES TREND</h3>
            <p className="muted">
              {trend.startLabel} - {trend.endLabel}, {new Date().getFullYear()} · POS
              Terminal
            </p>
          </div>
          <AdminTrendRangeTabs onSelect={setTrendRange} value={trendRange} />
        </div>

        <AdminTrendSummary trend={trend} />
        <AdminTrendChart peakKey={peakKey} trend={trend} />
        <AdminTrendBreakdown trend={trend} trendRange={trendRange} />
      </section>
    </div>
  )
}

export default AdminDashboardPage
