import { useEffect } from 'react'

const DEFAULT_INTERVAL_MS = 5000
const DEFAULT_BACKOFF_MULTIPLIER = 1.8
const DEFAULT_JITTER_RATIO = 0.15
const MIN_DELAY_MS = 250
const MAX_JITTER_RATIO = 0.5

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

const clampDelay = (value: number) => Math.max(MIN_DELAY_MS, Math.round(value))

const clampJitterRatio = (value: number) => Math.max(0, Math.min(value, MAX_JITTER_RATIO))

const getJitteredDelay = (delayMs: number, jitterRatio: number) => {
  const safeRatio = clampJitterRatio(jitterRatio)

  if (safeRatio === 0) {
    return clampDelay(delayMs)
  }

  const spread = delayMs * safeRatio
  const minDelay = delayMs - spread
  const maxDelay = delayMs + spread

  return clampDelay(minDelay + Math.random() * (maxDelay - minDelay))
}

const getNextBackoffDelay = ({
  backoffMultiplier,
  currentIntervalMs,
  maxIntervalMs,
}: {
  backoffMultiplier: number
  currentIntervalMs: number
  maxIntervalMs: number
}) => {
  const safeMultiplier = Math.max(1, backoffMultiplier)
  const nextDelay = clampDelay(currentIntervalMs * safeMultiplier)

  return Math.min(maxIntervalMs, nextDelay)
}

const canRunInCurrentTab = (pauseWhenHidden: boolean) =>
  !pauseWhenHidden || typeof document === 'undefined' || !document.hidden

export const useLiveSyncPolling = ({
  enabled,
  sync,
  intervalMs = DEFAULT_INTERVAL_MS,
  maxIntervalMs,
  backoffMultiplier = DEFAULT_BACKOFF_MULTIPLIER,
  jitterRatio = DEFAULT_JITTER_RATIO,
  runOnMount = true,
  pauseWhenHidden = true,
}: LiveSyncPollingOptions) => {
  useEffect(() => {
    if (!enabled) {
      return
    }

    const maxDelayMs = maxIntervalMs ?? Math.max(intervalMs * 4, intervalMs)

    let timeoutId: number | null = null
    let disposed = false
    let inFlight = false
    let currentIntervalMs = intervalMs

    const clearSchedule = () => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId)
        timeoutId = null
      }
    }

    const scheduleNext = (delayMs: number) => {
      clearSchedule()

      if (disposed || !canRunInCurrentTab(pauseWhenHidden)) {
        return
      }

      timeoutId = window.setTimeout(() => {
        void run()
      }, getJitteredDelay(delayMs, jitterRatio))
    }

    const run = async () => {
      if (disposed || inFlight || !canRunInCurrentTab(pauseWhenHidden)) {
        return
      }

      inFlight = true

      try {
        await sync()
        currentIntervalMs = intervalMs
      } catch {
        currentIntervalMs = getNextBackoffDelay({
          backoffMultiplier,
          currentIntervalMs,
          maxIntervalMs: maxDelayMs,
        })
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
