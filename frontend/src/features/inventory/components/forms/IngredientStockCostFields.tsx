import Input from '../../../../shared/components/ui/Input'
import Select from '../../../../shared/components/ui/Select'
import { getBulkUnitOptions, type IngredientErrors, type IngredientFormState } from '../../inventory.admin-form'

type IngredientStockCostFieldsProps = {
  derivedUnitCost: number | null
  errors: IngredientErrors
  form: IngredientFormState
  onFormChange: (next: IngredientFormState) => void
  onUnitCostManualChange: (isManual: boolean) => void
}

function IngredientStockCostFields({
  derivedUnitCost,
  errors,
  form,
  onFormChange,
  onUnitCostManualChange,
}: IngredientStockCostFieldsProps) {
  return (
    <>
      <Input
        label="On hand"
        placeholder="0"
        type="number"
        min={0}
        step="any"
        inputMode="decimal"
        autoComplete="new-password"
        value={form.onHand}
        onChange={(event) => onFormChange({ ...form, onHand: event.target.value })}
        error={errors.onHand}
      />
      <Input
        label="Reorder level"
        placeholder="0"
        type="number"
        min={0}
        step="any"
        inputMode="decimal"
        autoComplete="new-password"
        value={form.reorderLevel}
        onChange={(event) => onFormChange({ ...form, reorderLevel: event.target.value })}
        error={errors.reorderLevel}
      />
      <Input
        label="Unit cost"
        placeholder="0.00"
        type="number"
        min={0}
        step="any"
        inputMode="decimal"
        autoComplete="new-password"
        value={form.unitCost}
        onChange={(event) => {
          const nextValue = event.target.value
          onFormChange({ ...form, unitCost: nextValue })
          onUnitCostManualChange(nextValue.trim().length > 0)
        }}
        error={errors.unitCost}
        helperText="Cost per base unit (e.g., per g, ml, or pcs)"
      />
      <div className="admin-form-grid">
        <Input
          label="Bulk quantity (optional)"
          placeholder="0"
          type="number"
          min={0}
          step="any"
          inputMode="decimal"
          autoComplete="new-password"
          value={form.bulkQty}
          onChange={(event) => onFormChange({ ...form, bulkQty: event.target.value })}
        />
        <Select
          label="Bulk unit"
          value={form.bulkUnit}
          onChange={(event) =>
            onFormChange({
              ...form,
              bulkUnit: event.target.value as IngredientFormState['bulkUnit'],
            })
          }
          options={getBulkUnitOptions(form.baseUnit)}
        />
        <Input
          label="Bulk price (optional)"
          placeholder="0.00"
          type="number"
          min={0}
          step="any"
          inputMode="decimal"
          autoComplete="new-password"
          value={form.bulkPrice}
          onChange={(event) => onFormChange({ ...form, bulkPrice: event.target.value })}
          helperText={
            derivedUnitCost !== null
              ? `Calculated unit cost: P${derivedUnitCost.toFixed(4)}`
              : 'Enter bulk quantity + price to auto-calculate unit cost.'
          }
        />
      </div>
    </>
  )
}

export default IngredientStockCostFields
