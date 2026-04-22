import Input from '../../../../shared/components/ui/Input'
import type { SettingsErrors, SettingsFormState } from '../../admin.settings-form'

type SettingsTaxSectionProps = {
  errors: SettingsErrors
  form: SettingsFormState
  onFormChange: (next: SettingsFormState) => void
}

function SettingsTaxSection({ errors, form, onFormChange }: SettingsTaxSectionProps) {
  return (
    <div className="admin-settings-section">
      <div className="admin-section-title">
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
          onChange={(event) => onFormChange({ ...form, taxRate: event.target.value })}
          error={errors.taxRate}
        />
        <Input
          label="Service charge (%) (optional)"
          inputMode="decimal"
          value={form.serviceChargeRate}
          onChange={(event) => onFormChange({ ...form, serviceChargeRate: event.target.value })}
          error={errors.serviceChargeRate}
          placeholder="Leave blank to disable"
        />
      </div>
    </div>
  )
}

export default SettingsTaxSection
