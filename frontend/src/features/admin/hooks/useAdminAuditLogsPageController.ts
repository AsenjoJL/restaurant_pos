import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '../../../app/store/hooks'
import { exportAuditCsv } from '../../../shared/lib/audit'
import { selectAuditEntries } from '../../../shared/store/audit.selectors'
import type { AuditScope, AuditSeverity } from '../../../shared/types/audit'
import {
  AUDIT_SCOPE_OPTIONS,
  AUDIT_SEVERITY_OPTIONS,
  filterAuditEntries,
} from '../admin.administration'

function useAdminAuditLogsPageController() {
  const navigate = useNavigate()
  const entries = useAppSelector(selectAuditEntries)
  const [query, setQuery] = useState('')
  const [scope, setScope] = useState<AuditScope | 'ALL'>('ALL')
  const [severity, setSeverity] = useState<AuditSeverity | 'ALL'>('ALL')

  const filtered = useMemo(
    () =>
      filterAuditEntries({
        entries,
        query,
        scope,
        severity,
      }),
    [entries, query, scope, severity],
  )

  return {
    filtered,
    query,
    scope,
    scopeOptions: AUDIT_SCOPE_OPTIONS,
    severity,
    severityOptions: AUDIT_SEVERITY_OPTIONS,
    handleBackToAdministration: () => navigate('/admin/administration'),
    handleExport: () => exportAuditCsv(filtered),
    setQuery,
    setScope,
    setSeverity,
  }
}

export default useAdminAuditLogsPageController
