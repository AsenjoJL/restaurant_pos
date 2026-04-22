import type { SettingsFormState } from '../../admin.settings-form'

type SettingsReceiptSectionProps = {
  form: SettingsFormState
  onFormChange: (next: SettingsFormState) => void
}

function SettingsReceiptSection({ form, onFormChange }: SettingsReceiptSectionProps) {
  return (
    <div className="admin-settings-section admin-settings-wide">
      <div className="admin-section-title">
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
            onChange={(event) => onFormChange({ ...form, receiptFooter: event.target.value })}
          />
        </label>
      </div>
    </div>
  )
}

export default SettingsReceiptSection
