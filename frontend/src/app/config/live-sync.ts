import { env } from './env'
import type { LiveSyncPollingOptions } from '../../shared/hooks/useLiveSyncPolling'
import type { LiveSyncSettings } from '../../shared/types/live-sync'

export const LIVE_SYNC_INTERVALS_MS = {
  kitchenQueue: env.syncKitchenMs,
  salesRecords: env.syncSalesMs,
  cashierOrders: env.syncOrdersMs,
} as const

export type LiveSyncChannel = keyof typeof LIVE_SYNC_INTERVALS_MS

export const getLiveSyncIntervalMs = (channel: LiveSyncChannel) =>
  LIVE_SYNC_INTERVALS_MS[channel]

export const getDefaultLiveSyncSettings = (): LiveSyncSettings => ({
  kitchenIntervalMs: env.syncKitchenMs,
  salesIntervalMs: env.syncSalesMs,
  ordersIntervalMs: env.syncOrdersMs,
  backoffMultiplier: env.syncBackoffMultiplier,
  maxIntervalMultiplier: env.syncMaxIntervalMultiplier,
  jitterRatio: env.syncJitterRatio,
})

const clampNumber = (value: number, fallback: number, min: number, max: number) => {
  if (!Number.isFinite(value)) {
    return fallback
  }
  return Math.min(max, Math.max(min, value))
}

const mergeLiveSyncSettings = (settings?: LiveSyncSettings): LiveSyncSettings => {
  const defaults = getDefaultLiveSyncSettings()
  if (!settings) {
    return defaults
  }
  return {
    kitchenIntervalMs: clampNumber(settings.kitchenIntervalMs, defaults.kitchenIntervalMs, 1000, 60000),
    salesIntervalMs: clampNumber(settings.salesIntervalMs, defaults.salesIntervalMs, 1000, 60000),
    ordersIntervalMs: clampNumber(settings.ordersIntervalMs, defaults.ordersIntervalMs, 1000, 60000),
    backoffMultiplier: clampNumber(settings.backoffMultiplier, defaults.backoffMultiplier, 1.1, 5),
    maxIntervalMultiplier: clampNumber(
      settings.maxIntervalMultiplier,
      defaults.maxIntervalMultiplier,
      1,
      20,
    ),
    jitterRatio: clampNumber(settings.jitterRatio, defaults.jitterRatio, 0, 0.5),
  }
}

export const getLiveSyncPollingOptions = (
  channel: LiveSyncChannel,
  settings?: LiveSyncSettings,
): Pick<
  LiveSyncPollingOptions,
  'intervalMs' | 'maxIntervalMs' | 'backoffMultiplier' | 'jitterRatio'
> => {
  const merged = mergeLiveSyncSettings(settings)
  const intervalByChannel: Record<LiveSyncChannel, number> = {
    kitchenQueue: merged.kitchenIntervalMs,
    salesRecords: merged.salesIntervalMs,
    cashierOrders: merged.ordersIntervalMs,
  }
  const intervalMs = intervalByChannel[channel]
  return {
    intervalMs,
    maxIntervalMs: Math.round(intervalMs * merged.maxIntervalMultiplier),
    backoffMultiplier: merged.backoffMultiplier,
    jitterRatio: merged.jitterRatio,
  }
}
