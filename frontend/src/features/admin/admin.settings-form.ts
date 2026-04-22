import { hasValidationErrors } from '../../shared/lib/validation'
import type { AdminSettings } from './admin.types'

export type SettingsFormState = {
  storeName: string
  taxRate: string
  serviceChargeRate: string
  receiptFooter: string
  kitchenIntervalMs: string
  salesIntervalMs: string
  ordersIntervalMs: string
  backoffMultiplier: string
  maxIntervalMultiplier: string
  jitterRatio: string
}

export type SettingsErrors = {
  storeName?: string
  taxRate?: string
  serviceChargeRate?: string
  kitchenIntervalMs?: string
  salesIntervalMs?: string
  ordersIntervalMs?: string
  backoffMultiplier?: string
  maxIntervalMultiplier?: string
  jitterRatio?: string
}

type SettingsValidationResult = {
  errors: SettingsErrors
  payload?: AdminSettings
}

export const toSettingsFormState = (settings: AdminSettings): SettingsFormState => ({
  storeName: settings.storeName,
  taxRate: String(settings.taxRate),
  serviceChargeRate: settings.serviceChargeRate > 0 ? String(settings.serviceChargeRate) : '',
  receiptFooter: settings.receiptFooter,
  kitchenIntervalMs: String(settings.liveSync.kitchenIntervalMs),
  salesIntervalMs: String(settings.liveSync.salesIntervalMs),
  ordersIntervalMs: String(settings.liveSync.ordersIntervalMs),
  backoffMultiplier: String(settings.liveSync.backoffMultiplier),
  maxIntervalMultiplier: String(settings.liveSync.maxIntervalMultiplier),
  jitterRatio: String(settings.liveSync.jitterRatio),
})

export const validateSettingsForm = (form: SettingsFormState): SettingsValidationResult => {
  const errors: SettingsErrors = {}

  if (!form.storeName.trim()) {
    errors.storeName = 'Store name is required.'
  }

  const taxRate = Number(form.taxRate)
  if (!Number.isFinite(taxRate) || taxRate < 0 || taxRate > 25) {
    errors.taxRate = 'Tax must be between 0 and 25.'
  }

  const serviceChargeRate =
    form.serviceChargeRate.trim().length === 0 ? 0 : Number(form.serviceChargeRate)
  if (
    form.serviceChargeRate.trim().length > 0 &&
    (!Number.isFinite(serviceChargeRate) || serviceChargeRate < 0 || serviceChargeRate > 20)
  ) {
    errors.serviceChargeRate = 'Service charge must be between 0 and 20.'
  }

  const kitchenIntervalMs = Number(form.kitchenIntervalMs)
  if (!Number.isFinite(kitchenIntervalMs) || kitchenIntervalMs < 1000 || kitchenIntervalMs > 60000) {
    errors.kitchenIntervalMs = 'Kitchen sync must be between 1000 and 60000 ms.'
  }

  const salesIntervalMs = Number(form.salesIntervalMs)
  if (!Number.isFinite(salesIntervalMs) || salesIntervalMs < 1000 || salesIntervalMs > 60000) {
    errors.salesIntervalMs = 'Sales sync must be between 1000 and 60000 ms.'
  }

  const ordersIntervalMs = Number(form.ordersIntervalMs)
  if (!Number.isFinite(ordersIntervalMs) || ordersIntervalMs < 1000 || ordersIntervalMs > 60000) {
    errors.ordersIntervalMs = 'Orders sync must be between 1000 and 60000 ms.'
  }

  const backoffMultiplier = Number(form.backoffMultiplier)
  if (!Number.isFinite(backoffMultiplier) || backoffMultiplier < 1.1 || backoffMultiplier > 5) {
    errors.backoffMultiplier = 'Backoff multiplier must be between 1.1 and 5.'
  }

  const maxIntervalMultiplier = Number(form.maxIntervalMultiplier)
  if (!Number.isFinite(maxIntervalMultiplier) || maxIntervalMultiplier < 1 || maxIntervalMultiplier > 20) {
    errors.maxIntervalMultiplier = 'Max interval multiplier must be between 1 and 20.'
  }

  const jitterRatio = Number(form.jitterRatio)
  if (!Number.isFinite(jitterRatio) || jitterRatio < 0 || jitterRatio > 0.5) {
    errors.jitterRatio = 'Jitter ratio must be between 0 and 0.5.'
  }

  if (hasValidationErrors(errors)) {
    return { errors }
  }

  return {
    errors,
    payload: {
      storeName: form.storeName.trim(),
      taxRate,
      serviceChargeRate,
      receiptFooter: form.receiptFooter.trim(),
      liveSync: {
        kitchenIntervalMs,
        salesIntervalMs,
        ordersIntervalMs,
        backoffMultiplier,
        maxIntervalMultiplier,
        jitterRatio,
      },
    },
  }
}
