import { useMemo } from 'react'
import { useAppSelector } from '../../../app/store/hooks'
import {
  selectAdminCategories,
  selectAdminProducts,
  selectAdminUsers,
} from '../admin.selectors'
import AdminQuickLinkCard from '../components/AdminQuickLinkCard'
import AdminStatCard from '../components/AdminStatCard'

function AdminDashboardPage() {
  const categories = useAppSelector(selectAdminCategories)
  const products = useAppSelector(selectAdminProducts)
  const users = useAppSelector(selectAdminUsers)

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
          label="Products"
          value={String(stats.products)}
          helper="Total items"
          icon="inventory_2"
        />
        <AdminStatCard
          label="Active Products"
          value={String(stats.activeProducts)}
          helper="Visible on POS"
          icon="visibility"
        />
        <AdminStatCard label="Staff Users" value={String(stats.staff)} icon="groups" />
        <AdminStatCard label="Active Staff" value={String(stats.activeUsers)} icon="person" />
      </div>

      <div className="admin-section-header">
        <h3>Quick Actions</h3>
      </div>

      <div className="admin-quick-links">
        <AdminQuickLinkCard
          title="Manage Products"
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
