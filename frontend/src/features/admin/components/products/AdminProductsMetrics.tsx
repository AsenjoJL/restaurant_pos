import AdminStatCard from '../AdminStatCard'

type AdminProductsMetricsProps = {
  stats: {
    active: number
    categories: number
    hidden: number
    total: number
  }
}

function AdminProductsMetrics({ stats }: AdminProductsMetricsProps) {
  return (
    <div className="admin-metrics">
      <AdminStatCard label="Total Menu Items" value={String(stats.total)} icon="/menu.png" />
      <AdminStatCard
        label="Active"
        value={String(stats.active)}
        helper="Visible on POS"
        icon="/items.png"
      />
      <AdminStatCard
        label="Hidden"
        value={String(stats.hidden)}
        helper="Not visible"
        icon="/clear.png"
      />
      <AdminStatCard
        label="Categories"
        value={String(stats.categories)}
        icon="/catalogue.png"
      />
    </div>
  )
}

export default AdminProductsMetrics
