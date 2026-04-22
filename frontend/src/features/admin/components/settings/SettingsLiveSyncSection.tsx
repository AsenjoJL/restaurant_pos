import Input from '../../../../shared/components/ui/Input'
import type { SettingsErrors, SettingsFormState } from '../../admin.settings-form'

type SettingsLiveSyncSectionProps = {
  errors: SettingsErrors
  form: SettingsFormState
  onFormChange: (next: SettingsFormState) => void
}

function SettingsLiveSyncSection({ errors, form, onFormChange }: SettingsLiveSyncSectionProps) {
  return (
    <div className="admin-settings-section admin-settings-wide">
      <div className="admin-section-title">
        <div>
          <h3>Live Sync</h3>
          <p className="muted">Polling timings available for repository sync behavior.</p>
        </div>
      </div>
      <div className="admin-form-grid">
        <Input
          label="Kitchen sync (ms)"
          inputMode="numeric"
          value={form.kitchenIntervalMs}
          onChange={(event) => onFormChange({ ...form, kitchenIntervalMs: event.target.value })}
          error={errors.kitchenIntervalMs}
        />
        <Input
          label="Sales sync (ms)"
          inputMode="numeric"
          value={form.salesIntervalMs}
          onChange={(event) => onFormChange({ ...form, salesIntervalMs: event.target.value })}
          error={errors.salesIntervalMs}
        />
        <Input
          label="Orders sync (ms)"
          inputMode="numeric"
          value={form.ordersIntervalMs}
          onChange={(event) => onFormChange({ ...form, ordersIntervalMs: event.target.value })}
          error={errors.ordersIntervalMs}
        />
        <Input
          label="Backoff multiplier"
          inputMode="decimal"
          value={form.backoffMultiplier}
          onChange={(event) => onFormChange({ ...form, backoffMultiplier: event.target.value })}
          error={errors.backoffMultiplier}
        />
        <Input
          label="Max interval multiplier"
          inputMode="decimal"
          value={form.maxIntervalMultiplier}
          onChange={(event) => onFormChange({ ...form, maxIntervalMultiplier: event.target.value })}
          error={errors.maxIntervalMultiplier}
        />
        <Input
          label="Jitter ratio"
          inputMode="decimal"
          value={form.jitterRatio}
          onChange={(event) => onFormChange({ ...form, jitterRatio: event.target.value })}
          error={errors.jitterRatio}
        />
      </div>
    </div>
  )
}

export default SettingsLiveSyncSection
