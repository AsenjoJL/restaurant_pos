import Button from '../../../shared/components/ui/Button'
import AdminQuickLinksGrid from '../components/AdminQuickLinksGrid'
import useAdminCatalogPageController from '../hooks/useAdminCatalogPageController'

function AdminCatalogPage() {
  const { handleBackToDashboard, links } = useAdminCatalogPageController()

  return (
    <section className="admin-page admin-catalog-page">
        <div className="page-header">
            <div>
              <h2>Catalog</h2>
                <p className="muted">Manage menu items, categories, and recipes.</p>
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

export default AdminCatalogPage
