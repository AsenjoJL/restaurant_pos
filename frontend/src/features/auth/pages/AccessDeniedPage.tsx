import Button from '../../../shared/components/ui/Button'

function AccessDeniedPage() {
  return (
    <div className="page-center">
      <div className="panel empty-state">
        <h2>Access denied</h2>
        <p className="muted">You do not have permission to view this area.</p>
        <Button variant="outline" onClick={() => window.history.back()}>
          Go Back
        </Button>
      </div>
    </div>
  )
}

export default AccessDeniedPage
