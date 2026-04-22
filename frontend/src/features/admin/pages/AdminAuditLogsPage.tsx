import Button from '../../../shared/components/ui/Button'
import AuditFiltersCard from '../components/audit/AuditFiltersCard'
import AuditLogsTable from '../components/audit/AuditLogsTable'
import useAdminAuditLogsPageController from '../hooks/useAdminAuditLogsPageController'

function AdminAuditLogsPage() {
  const {
    filtered,
    query,
    scope,
    scopeOptions,
    severity,
    severityOptions,
    handleBackToAdministration,
    handleExport,
    setQuery,
    setScope,
    setSeverity,
  } = useAdminAuditLogsPageController()

  return (
    <div className="page admin-page admin-audit-page">
      <div className="page-header">
        <div>
          <h2>Audit Logs</h2>
          <p className="muted">Track actions across payments, cash drawer, and orders.</p>
        </div>
        <div className="admin-actions">
          <Button variant="outline" onClick={handleBackToAdministration}>
            Back to Administration
          </Button>
          <Button variant="outline" onClick={handleExport}>
            Export CSV
          </Button>
        </div>
      </div>

      <AuditFiltersCard
        query={query}
        scope={scope}
        scopeOptions={scopeOptions}
        severity={severity}
        severityOptions={severityOptions}
        onQueryChange={setQuery}
        onScopeChange={setScope}
        onSeverityChange={setSeverity}
      />

      <AuditLogsTable entries={filtered} />
    </div>
  )
}

export default AdminAuditLogsPage
