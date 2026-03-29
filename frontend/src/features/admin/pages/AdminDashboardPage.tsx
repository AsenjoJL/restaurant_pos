import { useMemo } from 'react'
import { useAppSelector } from '../../../app/store/hooks'
import { formatCurrency } from '../../../shared/lib/format'
import { isPaymentCaptured } from '../../../shared/lib/orders'
import {
  selectAdminProducts,
  selectAdminUsers,
} from '../admin.selectors'
import AdminStatCard from '../components/AdminStatCard'
import { selectOrders } from '../../orders/orders.selectors'
import {
  selectInventoryIngredients,
  selectInventoryRecipes,
} from '../../inventory/inventory.selectors'
import { calculateOrderCost } from '../../inventory/inventory.logic'

function AdminDashboardPage() {
  const products = useAppSelector(selectAdminProducts)
  const users = useAppSelector(selectAdminUsers)
  const orders = useAppSelector(selectOrders)
  const ingredients = useAppSelector(selectInventoryIngredients)
  const recipes = useAppSelector(selectInventoryRecipes)

  const stats = useMemo(() => {
    const activeProducts = products.filter((product) => product.isActive).length
    const activeUsers = users.filter((user) => user.isActive).length
    return {
      products: products.length,
      activeProducts,
      staff: users.length,
      activeUsers,
    }
  }, [products, users])

  const analytics = useMemo(() => {
    const today = new Date()
    const isToday = (value: string) => {
      const at = new Date(value)
      return (
        at.getFullYear() === today.getFullYear() &&
        at.getMonth() === today.getMonth() &&
        at.getDate() === today.getDate()
      )
    }

    const paidOrders = orders.filter((order) => isPaymentCaptured(order))
    const todaySales = paidOrders
      .filter((order) => isToday(order.placed_at))
      .reduce((sum, order) => sum + order.total, 0)
    const netSales = paidOrders.reduce((sum, order) => sum + order.total, 0)
    const cogs = paidOrders.reduce(
      (sum, order) => sum + calculateOrderCost(order, recipes, ingredients),
      0,
    )
    const avgTicket = paidOrders.length > 0 ? netSales / paidOrders.length : 0
    const profit = netSales - cogs
    const lowStock = ingredients.filter(
      (item) => item.onHand <= item.reorderLevel,
    ).length
    const outOfStock = ingredients.filter((item) => item.onHand <= 0).length

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

    return {
      todaySales,
      totalOrders: orders.length,
      netSales,
      avgTicket,
      profit,
      lowStock,
      outOfStock,
      topItems,
    }
  }, [ingredients, orders, recipes])

  return (
    <div className="page admin-page">
      <div className="page-header">
        <div>
          <h2>Dashboard Overview</h2>
          <p className="muted">Real-time insights into your menu and staff performance.</p>
        </div>
      </div>

      {/* Top row */}
      <div className="admin-stats">
        <AdminStatCard
          label="Total Sales Today"
          value={formatCurrency(analytics.todaySales)}
          icon="today"
        />
        <AdminStatCard label="Total Orders" value={String(analytics.totalOrders)} icon="receipt_long" />
        <AdminStatCard label="Net Sales" value={formatCurrency(analytics.netSales)} icon="monitoring" />
        <AdminStatCard label="Estimated Profit" value={formatCurrency(analytics.profit)} icon="trending_up" />
        <AdminStatCard label="Average Ticket" value={formatCurrency(analytics.avgTicket)} icon="point_of_sale" />
      </div>

      {/* Second row */}
      <div className="admin-stats">
        <AdminStatCard label="Total Staff" value={String(stats.staff)} icon="groups" />
        <AdminStatCard label="Active Staff" value={String(stats.activeUsers)} icon="person" />
        <AdminStatCard
          label="Active Menu Items"
          value={String(stats.activeProducts)}
          helper="Visible on POS"
          icon="visibility"
        />
        <AdminStatCard
          label="Low / Out of Stock"
          value={`${analytics.lowStock} / ${analytics.outOfStock}`}
          helper="Monitor inventory risk"
          icon="warning"
        />
      </div>

      {/* Third row */}
      <div className="admin-section-header">
        <h3>Performance Snapshot</h3>
      </div>

      <div className="admin-grid admin-analytics-grid">
        <div className="panel admin-card">
          <div className="admin-card-header">
            <h3>Top 5 Selling Items</h3>
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

        <div className="panel admin-card admin-chart-card">
          <div className="admin-card-header">
            <h3>Sales Trend</h3>
            <span className="muted">Placeholder</span>
          </div>
          <div className="admin-chart-placeholder">
            <span className="material-symbols-rounded" aria-hidden="true">
              timeline
            </span>
            <p className="muted">Sales trend chart will appear here once wired to reporting data.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboardPage
