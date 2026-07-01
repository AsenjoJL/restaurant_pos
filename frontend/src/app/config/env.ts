const parsePositiveInt = (value: string | undefined, fallback: number) => {
  const parsed = Number.parseInt(value ?? '', 10)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback
  }
  return parsed
}

const parsePositiveFloat = (value: string | undefined, fallback: number) => {
  const parsed = Number.parseFloat(value ?? '')
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback
  }
  return parsed
}

export const env = {
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000').replace(/\/$/, ''),
  syncKitchenMs: parsePositiveInt(import.meta.env.VITE_SYNC_KITCHEN_MS, 5000),
  syncSalesMs: parsePositiveInt(import.meta.env.VITE_SYNC_SALES_MS, 5000),
  syncOrdersMs: parsePositiveInt(import.meta.env.VITE_SYNC_ORDERS_MS, 5000),
  syncBackoffMultiplier: parsePositiveFloat(
    import.meta.env.VITE_SYNC_BACKOFF_MULTIPLIER,
    1.8,
  ),
  syncMaxIntervalMultiplier: parsePositiveFloat(
    import.meta.env.VITE_SYNC_MAX_INTERVAL_MULTIPLIER,
    4,
  ),
  syncJitterRatio: parsePositiveFloat(import.meta.env.VITE_SYNC_JITTER_RATIO, 0.15),
}
