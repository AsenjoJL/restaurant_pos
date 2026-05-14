import type { AppDispatch } from '../../app/store/store'
import { isRecord, readLocalStorageJson } from '../../shared/lib/jsonStorage'
import { runSync } from '../../shared/lib/sync'
import {
  ADMIN_STORAGE_KEY,
  hydrateAdminFromRepository,
  setAdminState,
  syncAdminSnapshot,
} from './admin.store'
import type { AdminState } from './admin.types'

const readAdminSnapshotFromStorage = (): AdminState | null => {
  const parsed = readLocalStorageJson<AdminState>(ADMIN_STORAGE_KEY)
  if (
    !isRecord(parsed) ||
    !Array.isArray(parsed.categories) ||
    !Array.isArray(parsed.products) ||
    !Array.isArray(parsed.users) ||
    !parsed.settings
  ) {
    return null
  }
  return parsed
}

export const dispatchAndSyncAdmin = (
  dispatch: AppDispatch,
  action: Parameters<AppDispatch>[0],
) => {
  const previousSnapshot = readAdminSnapshotFromStorage()
  dispatch(action)
  return runSync(
    dispatch,
    async () => {
      await dispatch(syncAdminSnapshot()).unwrap()
    },
    {
      errorTitle: 'Sync failed',
      errorDescription: 'Changes were saved locally but failed to sync.',
    },
  ).then(async (synced) => {
    if (!synced) {
      if (previousSnapshot) {
        dispatch(setAdminState(previousSnapshot))
      }
      // Pull canonical server state so we do not keep unsynced local-only records.
      try {
        await dispatch(hydrateAdminFromRepository()).unwrap()
      } catch {
        // Keep original sync failure toast; best-effort rollback only.
      }
    }
    return synced
  })
}
