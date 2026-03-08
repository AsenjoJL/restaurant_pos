import { useMemo, useState } from 'react'
import { useAppSelector } from '../../../app/store/hooks'
import Button from '../../../shared/components/ui/Button'
import Input from '../../../shared/components/ui/Input'
import { exportAuditCsv } from '../../../shared/lib/audit'
import { selectAuditEntries } from '../../../shared/store/audit.selectors'
import type { AuditScope, AuditSeverity } from '../../../shared/types/audit'

function AdminAuditLogsPage() {
  const entries = useAppSelector(selectAuditEntries)

  const [query, setQuery] = useState('')
  const [scope, setScope] = useState<AuditScope | 'ALL'>('ALL')
  const [severity, setSeverity] = useState<AuditSeverity | 'ALL'>('ALL')

  const filtered = useMemo(() => {
    const trimmed = query.trim().toLowerCase()
    return entries.filter((entry) => {
      if (scope !== 'ALL' && entry.scope !== scope) {
        return false
      }
      if (severity !== 'ALL' && entry.severity !== severity) {
        return false
      }
      if (!trimmed) {
        return true
      }
      return (
        entry.message.toLowerCase().includes(trimmed) ||
        entry.action.toLowerCase().includes(trimmed) ||
        entry.scope.toLowerCase().includes(trimmed) ||
        (entry.user?.name.toLowerCase().includes(trimmed) ?? false)
      )
    })
  }, [entries, query, scope, severity])

  const scopeOptions: (AuditScope | 'ALL')[] = [
    'ALL',
    'ORDER',
    'PAYMENT',
    'CASH_DRAWER',
    'REPLACEMENT',
    'CASH_ADJUSTMENT',
    'INVENTORY',
    'AUTH',
    'SYSTEM',
  ]

  const severityOptions: (AuditSeverity | 'ALL')[] = ['ALL', 'INFO', 'WARN', 'ERROR']

  return (
    <div className="page admin-page">
      <div className="page-header">
        <div>
          <h2>Audit Logs</h2>
          <p className="muted">Track actions across payments, cash drawer, and orders.</p>
        </div>
        <Button variant="outline" onClick={() => exportAuditCsv(filtered)} icon="download">
          Export CSV
        </Button>
      </div>

      <div className="panel admin-card">
        <div className="admin-card-header">
          <h3>Filters</h3>
        </div>
        <div className="admin-filters">
          <Input
            label="Search"
            placeholder="Search by message, user, or action"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <label className="input-field">
            <span className="input-label">Scope</span>
            <select
              className="select"
              value={scope}
              onChange={(event) => setScope(event.target.value as AuditScope | 'ALL')}
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
              onChange={(event) => setSeverity(event.target.value as AuditSeverity | 'ALL')}
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

      <div className="panel admin-card">
        <div className="admin-card-header">
          <h3>Recent Activity</h3>
          <span className="muted">{filtered.length} events</span>
        </div>
        <div className="admin-table">
          <div className="admin-table-head admin-table-row">
            <span>Timestamp</span>
            <span>Scope</span>
            <span>Action</span>
            <span>User</span>
            <span>Message</span>
          </div>
          {filtered.map((entry) => (
            <div key={entry.id} className="admin-table-row">
              <span className="muted">{new Date(entry.createdAt).toLocaleString()}</span>
              <span className="chip">{entry.scope}</span>
              <span>{entry.action}</span>
              <span className="muted">{entry.user ? entry.user.name : 'System'}</span>
              <span className="muted">{entry.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AdminAuditLogsPage
