import Input from '../../../../shared/components/ui/Input'
import Select from '../../../../shared/components/ui/Select'
import {
  INVENTORY_ADJUSTMENT_REASON_OPTIONS,
  INVENTORY_ADJUSTMENT_TYPE_OPTIONS,
} from '../../inventory.adjustments'
import type { AdjustErrors, AdjustFormState } from '../../inventory.admin-form'

type AdjustmentDetailsFieldsProps = {
  errors: AdjustErrors
  form: AdjustFormState
  ingredientOptions: Array<{ value: string; label: string }>
  onFormChange: (next: AdjustFormState) => void
  onReasonTypeChange: (reasonType: AdjustFormState['reasonType']) => void
}

function AdjustmentDetailsFields({
  errors,
  form,
  ingredientOptions,
  onFormChange,
  onReasonTypeChange,
}: AdjustmentDetailsFieldsProps) {
  return (
    <>
      <Select
        label="Ingredient"
        value={form.ingredientId}
        onChange={(event) => onFormChange({ ...form, ingredientId: event.target.value })}
        options={ingredientOptions}
        error={errors.ingredientId}
      />
      <Select
        label="Adjustment Type"
        value={form.type}
        onChange={(event) =>
          onFormChange({
            ...form,
            type: event.target.value as AdjustFormState['type'],
          })
        }
        options={INVENTORY_ADJUSTMENT_TYPE_OPTIONS.map((option) => ({ ...option }))}
        disabled={form.reasonType !== 'MANUAL'}
      />
      <Select
        label="Reason Type"
        value={form.reasonType}
        onChange={(event) => onReasonTypeChange(event.target.value as AdjustFormState['reasonType'])}
        options={INVENTORY_ADJUSTMENT_REASON_OPTIONS.map((option) => ({ ...option }))}
      />
      {form.reasonType === 'VARIANCE' ? (
        <Input
          label="Counted quantity"
          placeholder="0"
          type="number"
          min={0}
          step="any"
          inputMode="decimal"
          autoComplete="new-password"
          value={form.countedQty}
          onChange={(event) => onFormChange({ ...form, countedQty: event.target.value })}
          error={errors.qty}
        />
      ) : (
        <Input
          label={form.reasonType === 'RESTOCK' ? 'Restock amount' : 'Quantity'}
          placeholder="0"
          type="number"
          min={0}
          step="any"
          inputMode="decimal"
          autoComplete="new-password"
          value={form.qty}
          onChange={(event) => onFormChange({ ...form, qty: event.target.value })}
          error={errors.qty}
        />
      )}
      <Input
        label="Reason"
        placeholder="Reason for adjustment"
        value={form.reason}
        onChange={(event) => onFormChange({ ...form, reason: event.target.value })}
        error={errors.reason}
      />
      {form.reasonType === 'RESTOCK' ? (
        <Input
          label="Restock reference"
          placeholder="RST-YYYYMMDD-###"
          value={form.reference}
          onChange={(event) => onFormChange({ ...form, reference: event.target.value })}
          error={errors.reference}
        />
      ) : null}
    </>
  )
}

export default AdjustmentDetailsFields
