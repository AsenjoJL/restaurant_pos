import Input from '../../../../shared/components/ui/Input'
import type { AuditScope, AuditSeverity } from '../../../../shared/types/audit'

type AuditFiltersCardProps = {
  query: string
  scope: AuditScope | 'ALL'
  scopeOptions: Array<AuditScope | 'ALL'>
  severity: AuditSeverity | 'ALL'
  severityOptions: Array<AuditSeverity | 'ALL'>
  onQueryChange: (value: string) => void
  onScopeChange: (value: AuditScope | 'ALL') => void
  onSeverityChange: (value: AuditSeverity | 'ALL') => void
}

function AuditFiltersCard({
  query,
  scope,
  scopeOptions,
  severity,
  severityOptions,
  onQueryChange,
  onScopeChange,
  onSeverityChange,
}: AuditFiltersCardProps) {
  return (
    <div className="panel admin-card">
      <div className="admin-card-header">
        <h3>Filters</h3>
      </div>
      <div className="admin-filters">
        <Input
          label="Search"
          placeholder="Search by message, user, or action"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
        <label className="input-field">
          <span className="input-label">Scope</span>
          <select
            className="select"
            value={scope}
            onChange={(event) => onScopeChange(event.target.value as AuditScope | 'ALL')}
          >
            {scopeOptions.map((value) => (
              <option key={value} value={value}>
                {value === 'ALL' ? 'All scopes' : value}
              </option>
            ))}
          </select>
        </label>
        <label className="input-field">
          <span className="input-label">Severity</span>
          <select
            className="select"
            value={severity}
            onChange={(event) => onSeverityChange(event.target.value as AuditSeverity | 'ALL')}
          >
            {severityOptions.map((value) => (
              <option key={value} value={value}>
                {value === 'ALL' ? 'All severities' : value}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  )
}

export default AuditFiltersCard
