import type { AuditLogEntry } from '../../../../shared/types/audit'

type AuditLogsTableProps = {
  entries: AuditLogEntry[]
}

function AuditLogsTable({ entries }: AuditLogsTableProps) {
  return (
    <div className="panel admin-card">
      <div className="admin-card-header">
        <h3>Recent Activity</h3>
        <span className="muted">{entries.length} events</span>
      </div>
      <div className="admin-table">
        <div className="admin-table-head admin-table-row">
          <span>Timestamp</span>
          <span>Scope</span>
          <span>Action</span>
          <span>User</span>
          <span>Message</span>
        </div>
        {entries.map((entry) => (
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
  )
}

export default AuditLogsTable
