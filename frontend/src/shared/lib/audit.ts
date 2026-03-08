import { addAuditEntry } from '../store/audit.store'
import type { AppDispatch } from '../../app/store/store'
import type { AuditLogEntry } from '../types/audit'
import type { Role } from '../../features/auth/auth.types'

const escapeCsv = (value: string) => `"${value.replace(/"/g, '""')}"`

export const logAuditEvent = (
  dispatch: AppDispatch,
  entry: Omit<AuditLogEntry, 'id' | 'createdAt'>,
) => {
  dispatch(addAuditEntry(entry))
}

export const buildAuditUser = (
  user?: { id: string; name: string; role: Role } | null,
) => (user ? { id: user.id, name: user.name, role: user.role } : undefined)

export const exportAuditCsv = (entries: AuditLogEntry[]) => {
  const headers = [
    'timestamp',
    'scope',
    'action',
    'severity',
    'message',
    'user',
    'entityId',
  ]
  const rows = entries.map((entry) => [
    entry.createdAt,
    entry.scope,
    entry.action,
    entry.severity,
    entry.message,
    entry.user ? `${entry.user.name} (${entry.user.role})` : '',
    entry.entityId ?? '',
  ])
  const csv = [headers, ...rows]
    .map((row) => row.map((value) => escapeCsv(String(value))).join(','))
    .join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
