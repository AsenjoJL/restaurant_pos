import { useCallback, useEffect, useState } from 'react'
import {
  type AdminOverrideScope,
  getAdminOverrideRemainingMs,
  isAdminOverrideActive,
  setAdminOverride,
} from '../lib/admin-override'

type UseAdminOverrideResult = {
  active: boolean
  remainingMs: number
  toggle: () => void
  setActive: (active: boolean) => void
}

export function useAdminOverride(
  scope: AdminOverrideScope,
  isAdmin: boolean,
  options?: { tickMs?: number },
): UseAdminOverrideResult {
  const tickMs = options?.tickMs ?? 1000

  const [active, setActiveState] = useState(() => isAdminOverrideActive(scope))
  const [remainingMs, setRemainingMs] = useState(() =>
    getAdminOverrideRemainingMs(scope),
  )

  const exposedActive = isAdmin ? active : false
  const exposedRemainingMs = isAdmin ? remainingMs : 0

  useEffect(() => {
    if (!isAdmin) {
      return
    }

    const sync = () => {
      setActiveState(isAdminOverrideActive(scope))
      setRemainingMs(getAdminOverrideRemainingMs(scope))
    }

    sync()
    const timer = window.setInterval(sync, tickMs)
    return () => window.clearInterval(timer)
  }, [isAdmin, scope, tickMs])

  const setActive = useCallback(
    (next: boolean) => {
      if (!isAdmin) {
        return
      }
      setAdminOverride(scope, next)
      setActiveState(next)
      setRemainingMs(next ? getAdminOverrideRemainingMs(scope) : 0)
    },
    [isAdmin, scope],
  )

  const toggle = useCallback(() => setActive(!exposedActive), [exposedActive, setActive])

  return {
    active: exposedActive,
    remainingMs: exposedRemainingMs,
    toggle,
    setActive,
  }
}

export default useAdminOverride
