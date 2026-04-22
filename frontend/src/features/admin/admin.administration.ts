import type { AuditLogEntry, AuditScope, AuditSeverity } from '../../shared/types/audit'

export const ADMINISTRATION_LINKS = [
  {
    title: 'Users',
    description: 'Invite staff and manage permissions.',
    to: '/admin/users',
    icon: '/staff.png',
  },
  {
    title: 'Audit Logs',
    description: 'Review changes and activity history.',
    to: '/admin/audit-logs',
    icon: '/audit logs.png',
  },
  {
    title: 'Settings',
    description: 'Configure store and system settings.',
    to: '/admin/settings',
    icon: '/setting.png',
  },
] as const

export const AUDIT_SCOPE_OPTIONS: Array<AuditScope | 'ALL'> = [
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

export const AUDIT_SEVERITY_OPTIONS: Array<AuditSeverity | 'ALL'> = ['ALL', 'INFO', 'WARN', 'ERROR']

export const filterAuditEntries = ({
  entries,
  query,
  scope,
  severity,
}: {
  entries: AuditLogEntry[]
  query: string
  scope: AuditScope | 'ALL'
  severity: AuditSeverity | 'ALL'
}) => {
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
}
