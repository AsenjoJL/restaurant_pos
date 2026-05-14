import {
  isRecord,
  readLocalStorageJson,
  removeLocalStorageItem,
  writeLocalStorageJson,
} from './jsonStorage'

export type AdminOverrideScope = 'cashier' | 'kitchen'

const KEY_PREFIX = 'pos.admin.override.v1'
const DEFAULT_DURATION_MS = 15 * 60 * 1000

type OverridePayload = {
  expiresAt: number
}

const keyFor = (scope: AdminOverrideScope) => `${KEY_PREFIX}.${scope}`

const readPayload = (scope: AdminOverrideScope): OverridePayload | null => {
  const parsed = readLocalStorageJson(keyFor(scope))
  if (!isRecord(parsed) || !Number.isFinite(parsed.expiresAt)) {
    return null
  }
  return parsed as OverridePayload
}

export const isAdminOverrideActive = (scope: AdminOverrideScope) => {
  const payload = readPayload(scope)
  if (!payload) {
    return false
  }
  const active = payload.expiresAt > Date.now()
  if (!active) {
    removeLocalStorageItem(keyFor(scope))
  }
  return active
}

export const getAdminOverrideRemainingMs = (scope: AdminOverrideScope) => {
  const payload = readPayload(scope)
  if (!payload) {
    return 0
  }
  return Math.max(payload.expiresAt - Date.now(), 0)
}

export const setAdminOverride = (
  scope: AdminOverrideScope,
  active: boolean,
  durationMs = DEFAULT_DURATION_MS,
) => {
  if (!active) {
    removeLocalStorageItem(keyFor(scope))
    return
  }
  const payload: OverridePayload = {
    expiresAt: Date.now() + durationMs,
  }
  writeLocalStorageJson(keyFor(scope), payload)
}

export const formatOverrideRemaining = (remainingMs: number) => {
  const minutes = Math.floor(remainingMs / 60000)
  const seconds = Math.floor((remainingMs % 60000) / 1000)
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}
