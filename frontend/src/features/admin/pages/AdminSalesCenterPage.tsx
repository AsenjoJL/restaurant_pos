import Button from '../../../shared/components/ui/Button'
import AdminQuickLinksGrid from '../components/AdminQuickLinksGrid'
import useAdminSalesCenterPageController from '../hooks/useAdminSalesCenterPageController'

function AdminSalesCenterPage() {
  const { handleBackToDashboard, links } = useAdminSalesCenterPageController()

  return (
    <section className="admin-page admin-sales-center-page">
      <div className="page-header">
        <div>
          <h2>Sales</h2>
          <p className="muted">Review sales activity, adjustments, and exceptions.</p>
        </div>
        <div className="admin-actions">
          <Button variant="outline" onClick={handleBackToDashboard}>
            Back to Dashboard
          </Button>
        </div>
      </div>

      <AdminQuickLinksGrid links={links} />
    </section>
  )
}

export default AdminSalesCenterPage
