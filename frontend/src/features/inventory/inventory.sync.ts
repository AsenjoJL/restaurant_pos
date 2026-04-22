import type { AppDispatch } from '../../app/store/store'
import { runSync } from '../../shared/lib/sync'
import { hydrateInventoryFromRepository } from './inventory.store'

type InventorySyncOptions = {
  errorTitle: string
  errorDescription: string
}

export const runInventorySync = async (
  dispatch: AppDispatch,
  syncCall: () => Promise<unknown>,
  options: InventorySyncOptions,
): Promise<boolean> =>
  runSync(
    dispatch,
    async () => {
      await syncCall()
      await dispatch(hydrateInventoryFromRepository()).unwrap()
    },
    options,
  )

export const refreshInventorySnapshot = async (
  dispatch: AppDispatch,
): Promise<void> => {
  await dispatch(hydrateInventoryFromRepository()).unwrap()
}
