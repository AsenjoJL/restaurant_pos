import { createSlice, nanoid } from '@reduxjs/toolkit'
import type { AuditLogEntry, AuditScope, AuditSeverity } from '../types/audit'

export const AUDIT_STORAGE_KEY = 'pos.audit.v1'

export type AuditState = {
  entries: AuditLogEntry[]
}

type CreateAuditPayload = {
  scope: AuditScope
  action: string
  message: string
  severity?: AuditSeverity
  user?: AuditLogEntry['user']
  entityId?: string
  metadata?: AuditLogEntry['metadata']
}

const loadStoredAudit = (): AuditState | null => {
  if (typeof window === 'undefined') {
    return null
  }
  try {
    const raw = localStorage.getItem(AUDIT_STORAGE_KEY)
    if (!raw) {
      return null
    }
    const parsed = JSON.parse(raw)
    if (!parsed || !Array.isArray(parsed.entries)) {
      return null
    }
    return parsed as AuditState
  } catch {
    return null
  }
}

const initialState: AuditState = loadStoredAudit() ?? { entries: [] }

const auditSlice = createSlice({
  name: 'audit',
  initialState,
  reducers: {
    addAuditEntry: (state, action: { payload: CreateAuditPayload }) => {
      state.entries.unshift({
        id: nanoid(),
        scope: action.payload.scope,
        action: action.payload.action,
        message: action.payload.message,
        severity: action.payload.severity ?? 'INFO',
        user: action.payload.user,
        entityId: action.payload.entityId,
        metadata: action.payload.metadata,
        createdAt: new Date().toISOString(),
      })
    },
    setAuditEntries: (state, action: { payload: AuditLogEntry[] }) => {
      state.entries = action.payload
    },
    clearAuditEntries: (state) => {
      state.entries = []
    },
  },
})

export const { addAuditEntry, setAuditEntries, clearAuditEntries } = auditSlice.actions
export default auditSlice.reducer
