import { useMemo } from 'react'
import { useAppSelector } from '../../../app/store/hooks'
import { formatCurrency } from '../../../shared/lib/format'
import { isPaymentCaptured } from '../../../shared/lib/orders'
import {
  selectAdminCategories,
  selectAdminProducts,
  selectAdminUsers,
} from '../admin.selectors'
import AdminQuickLinkCard from '../components/AdminQuickLinkCard'
import AdminStatCard from '../components/AdminStatCard'
import { selectOrders } from '../../orders/orders.selectors'
import {
  selectInventoryAdjustments,
  selectInventoryIngredients,
} from '../../inventory/inventory.selectors'

type SparklineData = {
  points: string
  min: number
  max: number
  count: number
}

const buildSparkline = (
  values: number[],
  width = 240,
  height = 80,
  padding = 8,
): SparklineData => {
  if (values.length === 0) {
    return { points: '', min: 0, max: 0, count: 0 }
  }

  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const step = values.length > 1 ? (width - padding * 2) / (values.length - 1) : 0
  const points = values
    .map((value, index) => {
      const x = padding + step * index
      const normalized = (value - min) / range
      const y = height - padding - normalized * (height - padding * 2)
      return `${x},${y}`
    })
    .join(' ')

  return { points, min, max, count: values.length }
}

function AdminDashboardPage() {
  const categories = useAppSelector(selectAdminCategories)
  const products = useAppSelector(selectAdminProducts)
  const users = useAppSelector(selectAdminUsers)
  const orders = useAppSelector(selectOrders)
  const ingredients = useAppSelector(selectInventoryIngredients)
  const adjustments = useAppSelector(selectInventoryAdjustments)

  const stats = useMemo(() => {
    const activeProducts = products.filter((product) => product.isActive).length
    const activeUsers = users.filter((user) => user.isActive).length
    return {
      categories: categories.length,
      products: products.length,
      activeProducts,
      staff: users.length,
      activeUsers,
    }
  }, [categories.length, products, users])

  const analytics = useMemo(() => {
    const paidOrders = orders.filter((order) => isPaymentCaptured(order))
    const paidSorted = [...paidOrders].sort(
      (a, b) => new Date(a.placed_at).getTime() - new Date(b.placed_at).getTime(),
    )
    const revenue = paidOrders.reduce((sum, order) => sum + order.total, 0)
    const netSales = revenue
    const avgTicket = paidOrders.length > 0 ? revenue / paidOrders.length : 0
    const profitMargin = 0.6
    const profit = netSales * profitMargin
    const pendingPayment = orders.filter((order) => order.status === 'PENDING_PAYMENT').length
    const readyForPickup = orders.filter((order) => order.status === 'READY_FOR_PICKUP').length
    const completed = orders.filter((order) => order.status === 'COMPLETED').length
    const inKitchen = orders.filter(
      (order) => order.status === 'SENT_TO_KITCHEN' || order.status === 'PREPARING',
    ).length
    const lowStock = ingredients.filter(
      (item) => item.onHand <= item.reorderLevel,
    ).length
    const inventoryOut = adjustments.filter((item) => item.type === 'OUT').length

    const itemCounts = new Map<string, number>()
    paidOrders.forEach((order) => {
      order.items.forEach((item) => {
        const current = itemCounts.get(item.name) ?? 0
        itemCounts.set(item.name, current + item.quantity)
      })
    })
    const topItems = Array.from(itemCounts.entries())
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5)

    const revenueSeries = paidSorted.slice(-8).map((order) => order.total)
    const sparkline = buildSparkline(revenueSeries)

    return {
      totalOrders: orders.length,
      paidOrders: paidOrders.length,
      revenue,
      netSales,
      avgTicket,
      profit,
      profitMargin,
      pendingPayment,
      readyForPickup,
      completed,
      inKitchen,
      lowStock,
      inventoryOut,
      topItems,
      sparkline,
    }
  }, [adjustments, ingredients, orders])

  return (
    <div className="page admin-page">
      <div className="page-header">
        <div>
          <h2>Dashboard Overview</h2>
          <p className="muted">Real-time insights into your menu and staff performance.</p>
        </div>
      </div>

      <div className="admin-stats">
        <AdminStatCard label="Categories" value={String(stats.categories)} icon="category" />
        <AdminStatCard
          label="Menu Items"
          value={String(stats.products)}
          helper="Total items"
          icon="inventory_2"
        />
        <AdminStatCard
          label="Active Menu Items"
          value={String(stats.activeProducts)}
          helper="Visible on POS"
          icon="visibility"
        />
        <AdminStatCard label="Staff Users" value={String(stats.staff)} icon="groups" />
        <AdminStatCard label="Active Staff" value={String(stats.activeUsers)} icon="person" />
      </div>

      <div className="admin-section-header">
        <h3>Order Analytics</h3>
      </div>

      <div className="admin-stats">
        <AdminStatCard
          label="Total Orders"
          value={String(analytics.totalOrders)}
          icon="receipt_long"
        />
        <AdminStatCard label="Paid Orders" value={String(analytics.paidOrders)} icon="payments" />
        <AdminStatCard
          label="Gross Sales"
          value={formatCurrency(analytics.revenue)}
          helper="Captured payments"
          icon="monitoring"
        />
        <AdminStatCard
          label="Net Sales"
          value={formatCurrency(analytics.netSales)}
          helper="Captured revenue"
          icon="trending_up"
        />
        <AdminStatCard
          label="Avg Ticket"
          value={formatCurrency(analytics.avgTicket)}
          helper="Per paid order"
          icon="point_of_sale"
        />
        <AdminStatCard
          label="Est. Profit"
          value={formatCurrency(analytics.profit)}
          helper={`Assumes ${Math.round(analytics.profitMargin * 100)}% margin`}
          icon="trending_up"
        />
        <AdminStatCard
          label="Pending Payment"
          value={String(analytics.pendingPayment)}
          icon="pending"
        />
        <AdminStatCard
          label="In Kitchen"
          value={String(analytics.inKitchen)}
          icon="restaurant"
        />
        <AdminStatCard
          label="Ready for Pickup"
          value={String(analytics.readyForPickup)}
          icon="campaign"
        />
        <AdminStatCard label="Completed" value={String(analytics.completed)} icon="done_all" />
      </div>

      <div className="admin-grid admin-analytics-grid">
        <div className="panel admin-card admin-chart-card">
          <div className="admin-card-header">
            <h3>Revenue Trend</h3>
            <span className="muted">Last {analytics.sparkline.count} paid orders</span>
          </div>
          <div className="admin-chart-metric">
            <strong>{formatCurrency(analytics.revenue)}</strong>
            <span className="muted">Captured revenue</span>
          </div>
          <svg className="admin-sparkline" viewBox="0 0 240 80" preserveAspectRatio="none">
            <polyline points={analytics.sparkline.points} />
          </svg>
          <div className="admin-chart-foot">
            <span className="muted">
              Min {formatCurrency(analytics.sparkline.min)} • Max{' '}
              {formatCurrency(analytics.sparkline.max)}
            </span>
          </div>
        </div>

        <div className="panel admin-card">
          <div className="admin-card-header">
            <h3>Most Menu Items Sold</h3>
            <span className="muted">{analytics.topItems.length} items</span>
          </div>
          <ul className="admin-list">
            {analytics.topItems.length > 0 ? (
              analytics.topItems.map((item) => (
                <li key={item.name}>
                  <span>{item.name}</span>
                  <strong>{item.qty}</strong>
                </li>
              ))
            ) : (
              <li>
                <span>No paid orders yet</span>
                <span className="muted">Waiting on payments</span>
              </li>
            )}
          </ul>
        </div>

        <div className="panel admin-card">
          <div className="admin-card-header">
            <h3>Inventory Pulse</h3>
          </div>
          <ul className="admin-list">
            <li>
              <span>Low stock items</span>
              <strong>{analytics.lowStock}</strong>
            </li>
            <li>
              <span>Stock deductions</span>
              <strong>{analytics.inventoryOut}</strong>
            </li>
          </ul>
        </div>
      </div>

      <div className="admin-section-header">
        <h3>Quick Actions</h3>
      </div>

      <div className="admin-quick-links">
        <AdminQuickLinkCard
          title="Manage Menu Items"
          description="Add items, set prices, and enable availability."
          to="/admin/products"
          icon="inventory"
        />
        <AdminQuickLinkCard
          title="Edit Categories"
          description="Organize the menu with clear categories."
          to="/admin/categories"
          icon="tune"
        />
        <AdminQuickLinkCard
          title="Staff Accounts"
          description="Create cashier or kitchen logins."
          to="/admin/users"
          icon="badge"
        />
        <AdminQuickLinkCard
          title="Store Settings"
          description="Tax, service charge, and receipt footer."
          to="/admin/settings"
          icon="settings"
        />
      </div>
    </div>
  )
}

export default AdminDashboardPage
