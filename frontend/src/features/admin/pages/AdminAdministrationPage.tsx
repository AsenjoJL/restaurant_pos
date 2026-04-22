import Button from '../../../shared/components/ui/Button'
import AdminQuickLinksGrid from '../components/AdminQuickLinksGrid'
import useAdminAdministrationPageController from '../hooks/useAdminAdministrationPageController'

function AdminAdministrationPage() {
  const { links, handleBackToDashboard } = useAdminAdministrationPageController()

  return (
    <section className="admin-page admin-administration-page">
      <div className="page-header">
        <div>
          <h2>Administration</h2>
          <p className="muted">Manage access, audit history, and preferences.</p>
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

export default AdminAdministrationPage
