import Input from '../../../../shared/components/ui/Input'
import Select from '../../../../shared/components/ui/Select'
import {
  INVENTORY_BASE_UNIT_FIELD_OPTIONS,
  INVENTORY_INGREDIENT_TYPE_FIELD_OPTIONS,
} from '../../inventory.adjustments'
import type { IngredientErrors, IngredientFormState } from '../../inventory.admin-form'
import type { IngredientBaseUnit, IngredientType } from '../../inventory.types'

type IngredientIdentityFieldsProps = {
  errors: IngredientErrors
  form: IngredientFormState
  ingredientCategoryOptions: Array<{ value: string; label: string }>
  onFormChange: (next: IngredientFormState) => void
}

function IngredientIdentityFields({
  errors,
  form,
  ingredientCategoryOptions,
  onFormChange,
}: IngredientIdentityFieldsProps) {
  return (
    <>
      <Input
        label="Ingredient name"
        placeholder="e.g. Chicken Thigh"
        value={form.name}
        onChange={(event) => onFormChange({ ...form, name: event.target.value })}
        error={errors.name}
      />
      <Select
        label="Ingredient type"
        value={form.ingredientType}
        onChange={(event) =>
          onFormChange({
            ...form,
            ingredientType: event.target.value as IngredientType,
          })
        }
        options={INVENTORY_INGREDIENT_TYPE_FIELD_OPTIONS.map((option) => ({ ...option }))}
      />
      <Select
        label="Category"
        value={form.category}
        onChange={(event) => onFormChange({ ...form, category: event.target.value })}
        options={ingredientCategoryOptions}
        error={errors.category}
      />
      <Select
        label="Base unit"
        value={form.baseUnit}
        onChange={(event) =>
          onFormChange({
            ...form,
            baseUnit: event.target.value as IngredientBaseUnit,
            bulkUnit: event.target.value as IngredientBaseUnit,
          })
        }
        options={INVENTORY_BASE_UNIT_FIELD_OPTIONS.map((option) => ({ ...option }))}
        error={errors.baseUnit}
      />
    </>
  )
}

export default IngredientIdentityFields
