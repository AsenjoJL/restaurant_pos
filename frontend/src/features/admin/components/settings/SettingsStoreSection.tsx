import Input from '../../../../shared/components/ui/Input'
import type { SettingsErrors, SettingsFormState } from '../../admin.settings-form'

type SettingsStoreSectionProps = {
  errors: SettingsErrors
  form: SettingsFormState
  onFormChange: (next: SettingsFormState) => void
}

function SettingsStoreSection({ errors, form, onFormChange }: SettingsStoreSectionProps) {
  return (
    <div className="admin-settings-section">
      <div className="admin-section-title">
        <div>
          <h3>Store Details</h3>
          <p className="muted">Displayed on slips and receipts.</p>
        </div>
      </div>
      <div className="admin-form-grid">
        <Input
          label="Store name"
          value={form.storeName}
          onChange={(event) => onFormChange({ ...form, storeName: event.target.value })}
          error={errors.storeName}
        />
      </div>
    </div>
  )
}

export default SettingsStoreSection
