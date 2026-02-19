import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../app/store/hooks'
import Button from '../../../shared/components/ui/Button'
import Input from '../../../shared/components/ui/Input'
import { pushToast } from '../../../shared/store/ui.store'
import { selectAdminSettings } from '../admin.selectors'
import { updateSettings } from '../admin.store'

type SettingsErrors = {
  storeName?: string
  taxRate?: string
  serviceChargeRate?: string
}

function AdminSettingsPage() {
  const dispatch = useAppDispatch()
  const settings = useAppSelector(selectAdminSettings)
  const [form, setForm] = useState({
    storeName: settings.storeName,
    taxRate: String(settings.taxRate),
    serviceChargeRate: String(settings.serviceChargeRate),
    receiptFooter: settings.receiptFooter,
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
    const serviceValue = Number(form.serviceChargeRate)
    if (!Number.isFinite(serviceValue) || serviceValue < 0 || serviceValue > 20) {
      nextErrors.serviceChargeRate = 'Service charge must be between 0 and 20.'
    }
    setErrors(nextErrors)
    return { nextErrors, taxValue, serviceValue }
  }

  const handleSave = () => {
    if (isSaving) {
      return
    }
    const { nextErrors, taxValue, serviceValue } = validate()
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
    dispatch(
      updateSettings({
        storeName: form.storeName.trim(),
        taxRate: taxValue,
        serviceChargeRate: serviceValue,
        receiptFooter: form.receiptFooter.trim(),
      }),
    )
    dispatch(
      pushToast({
        title: 'Settings saved',
        description: 'Store settings have been updated.',
        variant: 'success',
      }),
    )
    setTimeout(() => setIsSaving(false), 200)
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
                label="Service charge (%)"
                inputMode="decimal"
                value={form.serviceChargeRate}
                onChange={(event) =>
                  setForm({ ...form, serviceChargeRate: event.target.value })
                }
                error={errors.serviceChargeRate}
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
                  onChange={(event) =>
                    setForm({ ...form, receiptFooter: event.target.value })
                  }
                />
              </label>
            </div>
          </div>
        </div>
        <div className="admin-actions">
          <Button variant="primary" onClick={handleSave} disabled={isSaving} icon="save">
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default AdminSettingsPage
