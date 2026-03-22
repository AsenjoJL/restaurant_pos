import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../app/store/hooks'
import Button from '../../../shared/components/ui/Button'
import Input from '../../../shared/components/ui/Input'
import { pushToast } from '../../../shared/store/ui.store'
import { selectAdminSettings } from '../admin.selectors'
import { syncAdminSettings, updateSettings } from '../admin.store'

type SettingsErrors = {
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

function AdminSettingsPage() {
  const dispatch = useAppDispatch()
  const settings = useAppSelector(selectAdminSettings)
  const [form, setForm] = useState({
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
  const [errors, setErrors] = useState<SettingsErrors>({})
  const [isSaving, setIsSaving] = useState(false)

  const validate = () => {
    const nextErrors: SettingsErrors = {}
    if (!form.storeName.trim()) {
      nextErrors.storeName = 'Store name is required.'
    }
    const taxValue = Number(form.taxRate)
    if (!Number.isFinite(taxValue) || taxValue < 0 || taxValue > 25) {
      nextErrors.taxRate = 'Tax must be between 0 and 25.'
    }
    const serviceValue =
      form.serviceChargeRate.trim().length === 0 ? 0 : Number(form.serviceChargeRate)
    if (
      form.serviceChargeRate.trim().length > 0 &&
      (!Number.isFinite(serviceValue) || serviceValue < 0 || serviceValue > 20)
    ) {
      nextErrors.serviceChargeRate = 'Service charge must be between 0 and 20.'
    }
    const kitchenIntervalMs = Number(form.kitchenIntervalMs)
    if (!Number.isFinite(kitchenIntervalMs) || kitchenIntervalMs < 1000 || kitchenIntervalMs > 60000) {
      nextErrors.kitchenIntervalMs = 'Kitchen sync must be between 1000 and 60000 ms.'
    }
    const salesIntervalMs = Number(form.salesIntervalMs)
    if (!Number.isFinite(salesIntervalMs) || salesIntervalMs < 1000 || salesIntervalMs > 60000) {
      nextErrors.salesIntervalMs = 'Sales sync must be between 1000 and 60000 ms.'
    }
    const ordersIntervalMs = Number(form.ordersIntervalMs)
    if (!Number.isFinite(ordersIntervalMs) || ordersIntervalMs < 1000 || ordersIntervalMs > 60000) {
      nextErrors.ordersIntervalMs = 'Orders sync must be between 1000 and 60000 ms.'
    }
    const backoffMultiplier = Number(form.backoffMultiplier)
    if (!Number.isFinite(backoffMultiplier) || backoffMultiplier < 1.1 || backoffMultiplier > 5) {
      nextErrors.backoffMultiplier = 'Backoff multiplier must be between 1.1 and 5.'
    }
    const maxIntervalMultiplier = Number(form.maxIntervalMultiplier)
    if (
      !Number.isFinite(maxIntervalMultiplier) ||
      maxIntervalMultiplier < 1 ||
      maxIntervalMultiplier > 20
    ) {
      nextErrors.maxIntervalMultiplier = 'Max interval multiplier must be between 1 and 20.'
    }
    const jitterRatio = Number(form.jitterRatio)
    if (!Number.isFinite(jitterRatio) || jitterRatio < 0 || jitterRatio > 0.5) {
      nextErrors.jitterRatio = 'Jitter ratio must be between 0 and 0.5.'
    }
    setErrors(nextErrors)
    return {
      nextErrors,
      taxValue,
      serviceValue,
      kitchenIntervalMs,
      salesIntervalMs,
      ordersIntervalMs,
      backoffMultiplier,
      maxIntervalMultiplier,
      jitterRatio,
    }
  }

  const handleSave = async () => {
    if (isSaving) {
      return
    }
    const {
      nextErrors,
      taxValue,
      serviceValue,
      kitchenIntervalMs,
      salesIntervalMs,
      ordersIntervalMs,
      backoffMultiplier,
      maxIntervalMultiplier,
      jitterRatio,
    } = validate()
    if (Object.keys(nextErrors).length > 0) {
      dispatch(
        pushToast({
          title: 'Fix validation errors',
          description: 'Check the settings form.',
          variant: 'error',
        }),
      )
      return
    }
    setIsSaving(true)
    const previousSettings = settings
    const nextSettings = {
      storeName: form.storeName.trim(),
      taxRate: taxValue,
      serviceChargeRate: serviceValue,
      receiptFooter: form.receiptFooter.trim(),
      liveSync: {
        kitchenIntervalMs,
        salesIntervalMs,
        ordersIntervalMs,
        backoffMultiplier,
        maxIntervalMultiplier,
        jitterRatio,
      },
    }

    dispatch(updateSettings(nextSettings))

    try {
      await dispatch(syncAdminSettings(nextSettings)).unwrap()
      dispatch(
        pushToast({
          title: 'Settings saved',
          description: 'Store settings have been updated.',
          variant: 'success',
        }),
      )
    } catch {
      dispatch(updateSettings(previousSettings))
      dispatch(
        pushToast({
          title: 'Save failed',
          description: 'Settings were restored. Please try again.',
          variant: 'error',
        }),
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="page admin-page">
      <div className="page-header">
        <div>
          <h2>Settings</h2>
          <p className="muted">Configure tax rates and receipt messaging.</p>
        </div>
      </div>

      <div className="panel admin-card admin-settings-card">
        <div className="admin-settings-grid">
          <div className="admin-settings-section">
            <div className="admin-section-title">
              <span className="material-symbols-rounded section-icon" aria-hidden="true">
                storefront
              </span>
              <div>
                <h3>Store Details</h3>
                <p className="muted">Displayed on slips and receipts.</p>
              </div>
            </div>
            <div className="admin-form-grid">
              <Input
                label="Store name"
                value={form.storeName}
                onChange={(event) => setForm({ ...form, storeName: event.target.value })}
                error={errors.storeName}
              />
            </div>
          </div>

          <div className="admin-settings-section">
            <div className="admin-section-title">
              <span className="material-symbols-rounded section-icon" aria-hidden="true">
                percent
              </span>
              <div>
                <h3>Tax & Charges</h3>
                <p className="muted">Applied to all orders.</p>
              </div>
            </div>
            <div className="admin-form-grid">
              <Input
                label="Tax (%)"
                inputMode="decimal"
                value={form.taxRate}
                onChange={(event) => setForm({ ...form, taxRate: event.target.value })}
                error={errors.taxRate}
              />
              <Input
                label="Service charge (%) (optional)"
                inputMode="decimal"
                value={form.serviceChargeRate}
                onChange={(event) =>
                  setForm({ ...form, serviceChargeRate: event.target.value })
                }
                error={errors.serviceChargeRate}
                placeholder="Leave blank to disable"
              />
            </div>
          </div>

          <div className="admin-settings-section admin-settings-wide">
            <div className="admin-section-title">
              <span className="material-symbols-rounded section-icon" aria-hidden="true">
                receipt_long
              </span>
              <div>
                <h3>Receipt Footer</h3>
                <p className="muted">Short message printed below totals.</p>
              </div>
            </div>
            <div className="admin-form-grid">
              <label className="input-field admin-textarea">
                <span className="input-label">Footer message</span>
                <textarea
                  className="textarea"
                  placeholder="Thank you for dining with us."
                  value={form.receiptFooter}
                  name="receiptFooter"
                  onChange={(event) =>
                    setForm({ ...form, receiptFooter: event.target.value })
                  }
                />
              </label>
            </div>
          </div>

          <div className="admin-settings-section admin-settings-wide">
            <div className="admin-section-title">
              <span className="material-symbols-rounded section-icon" aria-hidden="true">
                sync
              </span>
              <div>
                <h3>Live Sync</h3>
                <p className="muted">Polling timings used in API mode.</p>
              </div>
            </div>
            <div className="admin-form-grid">
              <Input
                label="Kitchen sync (ms)"
                inputMode="numeric"
                value={form.kitchenIntervalMs}
                onChange={(event) =>
                  setForm({ ...form, kitchenIntervalMs: event.target.value })
                }
                error={errors.kitchenIntervalMs}
              />
              <Input
                label="Sales sync (ms)"
                inputMode="numeric"
                value={form.salesIntervalMs}
                onChange={(event) => setForm({ ...form, salesIntervalMs: event.target.value })}
                error={errors.salesIntervalMs}
              />
              <Input
                label="Orders sync (ms)"
                inputMode="numeric"
                value={form.ordersIntervalMs}
                onChange={(event) => setForm({ ...form, ordersIntervalMs: event.target.value })}
                error={errors.ordersIntervalMs}
              />
              <Input
                label="Backoff multiplier"
                inputMode="decimal"
                value={form.backoffMultiplier}
                onChange={(event) =>
                  setForm({ ...form, backoffMultiplier: event.target.value })
                }
                error={errors.backoffMultiplier}
              />
              <Input
                label="Max interval multiplier"
                inputMode="decimal"
                value={form.maxIntervalMultiplier}
                onChange={(event) =>
                  setForm({ ...form, maxIntervalMultiplier: event.target.value })
                }
                error={errors.maxIntervalMultiplier}
              />
              <Input
                label="Jitter ratio"
                inputMode="decimal"
                value={form.jitterRatio}
                onChange={(event) => setForm({ ...form, jitterRatio: event.target.value })}
                error={errors.jitterRatio}
              />
            </div>
          </div>
        </div>
        <div className="admin-actions">
          <Button
            variant="primary"
            onClick={() => {
              void handleSave()
            }}
            disabled={isSaving}
            icon="save"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default AdminSettingsPage
