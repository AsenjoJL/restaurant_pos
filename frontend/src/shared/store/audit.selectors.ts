import type { RootState } from '../../app/store/store'

export const selectAuditEntries = (state: RootState) => state.audit.entries
