export type AuditSeverity = 'INFO' | 'WARN' | 'ERROR'

export type AuditScope =
  | 'ORDER'
  | 'PAYMENT'
  | 'CASH_DRAWER'
  | 'REPLACEMENT'
  | 'CASH_ADJUSTMENT'
  | 'INVENTORY'
  | 'AUTH'
  | 'SYSTEM'

export type AuditLogEntry = {
  id: string
  scope: AuditScope
  action: string
  message: string
  severity: AuditSeverity
  createdAt: string
  user?: {
    id: string
    name: string
    role: string
  }
  entityId?: string
  metadata?: Record<string, string | number | boolean | null>
}
