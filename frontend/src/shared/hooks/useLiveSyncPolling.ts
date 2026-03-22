import { useEffect } from 'react'

export type LiveSyncPollingOptions = {
  enabled: boolean
  sync: () => void | Promise<void>
  intervalMs?: number
  maxIntervalMs?: number
  backoffMultiplier?: number
  jitterRatio?: number
  runOnMount?: boolean
  pauseWhenHidden?: boolean
}

export const useLiveSyncPolling = ({
  enabled,
  sync,
  intervalMs = 5000,
  maxIntervalMs = Math.max(intervalMs * 4, intervalMs),
  backoffMultiplier = 1.8,
  jitterRatio = 0.15,
  runOnMount = true,
  pauseWhenHidden = true,
}: LiveSyncPollingOptions) => {
  useEffect(() => {
    if (!enabled) {
      return
    }

    let timeoutId: number | null = null
    let disposed = false
    let inFlight = false
    let currentIntervalMs = intervalMs

    const clampDelay = (value: number) => Math.max(250, Math.round(value))
    const jitter = (value: number) => {
      const safeRatio = Math.max(0, Math.min(jitterRatio, 0.5))
      if (safeRatio === 0) {
        return clampDelay(value)
      }
      const spread = value * safeRatio
      const min = value - spread
      const max = value + spread
      return clampDelay(min + Math.random() * (max - min))
    }

    const shouldRun = () => !pauseWhenHidden || !document.hidden

    const clearSchedule = () => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId)
        timeoutId = null
      }
    }

    const scheduleNext = (delayMs: number) => {
      clearSchedule()
      if (disposed || !shouldRun()) {
        return
      }
      timeoutId = window.setTimeout(() => {
        void run()
      }, jitter(delayMs))
    }

    const run = async () => {
      if (disposed || inFlight || !shouldRun()) {
        return
      }
      inFlight = true
      try {
        await sync()
        currentIntervalMs = intervalMs
      } catch {
        const multiplied = currentIntervalMs * Math.max(1, backoffMultiplier)
        currentIntervalMs = Math.min(maxIntervalMs, clampDelay(multiplied))
      } finally {
        inFlight = false
      }
      scheduleNext(currentIntervalMs)
    }

    const handleVisibilityChange = () => {
      if (!pauseWhenHidden) {
        return
      }
      if (document.hidden) {
        clearSchedule()
        return
      }
      currentIntervalMs = intervalMs
      void run()
    }

    if (runOnMount) {
      void run()
    } else {
      scheduleNext(currentIntervalMs)
    }

    if (pauseWhenHidden) {
      document.addEventListener('visibilitychange', handleVisibilityChange)
    }

    return () => {
      disposed = true
      if (pauseWhenHidden) {
        document.removeEventListener('visibilitychange', handleVisibilityChange)
      }
      clearSchedule()
    }
  }, [
    backoffMultiplier,
    enabled,
    intervalMs,
    jitterRatio,
    maxIntervalMs,
    pauseWhenHidden,
    runOnMount,
    sync,
  ])
}
