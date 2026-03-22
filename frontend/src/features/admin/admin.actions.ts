import type { AppDispatch } from '../../app/store/store'
import { runSync } from '../../shared/lib/sync'
import { syncAdminSnapshot } from './admin.store'

export const dispatchAndSyncAdmin = (
  dispatch: AppDispatch,
  action: Parameters<AppDispatch>[0],
) => {
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
  )
}
