import type { AppDispatch } from '../../app/store/store'
import { pushToast } from '../store/ui.store'

type RunSyncOptions = {
  successTitle?: string
  successDescription?: string
  errorTitle?: string
  errorDescription?: string
  showErrorToast?: boolean
}

export const runSync = async (
  dispatch: AppDispatch,
  syncCall: () => Promise<unknown>,
  options: RunSyncOptions = {},
): Promise<boolean> => {
  const {
    successTitle,
    successDescription,
    errorTitle = 'Sync failed',
    errorDescription = 'Saved locally, but repository sync failed. Please retry.',
    showErrorToast = true,
  } = options

  try {
    await syncCall()
    if (successTitle) {
      dispatch(
        pushToast({
          title: successTitle,
          description: successDescription,
          variant: 'success',
        }),
      )
    }
    return true
  } catch {
    if (showErrorToast) {
      dispatch(
        pushToast({
          title: errorTitle,
          description: errorDescription,
          variant: 'error',
        }),
      )
    }
    return false
  }
}
