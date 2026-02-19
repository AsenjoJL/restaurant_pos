import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '../../app/store/hooks'
import { lockCommand, unlockCommand } from '../store/ui.store'

export const useCommandLock = (key: string) => {
  const dispatch = useAppDispatch()
  const isLocked = useAppSelector((state) => Boolean(state.ui.commandLocks[key]))

  const withLock = useCallback(
    async (action: () => Promise<void> | void) => {
      if (isLocked) {
        return
      }
      dispatch(lockCommand(key))
      try {
        await action()
      } finally {
        dispatch(unlockCommand(key))
      }
    },
    [dispatch, isLocked, key],
  )

  return { isLocked, withLock }
}
