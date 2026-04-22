import type { Dispatch, SetStateAction } from 'react'
import Button from '../../../../shared/components/ui/Button'
import Input from '../../../../shared/components/ui/Input'
import Modal from '../../../../shared/components/ui/Modal'
import Select from '../../../../shared/components/ui/Select'
import {
  INGREDIENT_BASE_UNIT_OPTIONS,
  INGREDIENT_TYPE_OPTIONS,
} from '../../inventory.recipes-page'
import type {
  RecipeIngredientErrors,
  RecipeIngredientFormState,
} from '../../inventory.recipe-form'
import type { IngredientBaseUnit, IngredientType } from '../../inventory.types'

type RecipeIngredientModalProps = {
  ingredientCategoryOptions: Array<{ value: string; label: string }>
  ingredientErrors: RecipeIngredientErrors
  ingredientForm: RecipeIngredientFormState
  isOpen: boolean
  setIngredientForm: Dispatch<SetStateAction<RecipeIngredientFormState>>
  onClose: () => void
  onCreateIngredient: () => void
}

function RecipeIngredientModal({
  ingredientCategoryOptions,
  ingredientErrors,
  ingredientForm,
  isOpen,
  setIngredientForm,
  onClose,
  onCreateIngredient,
}: RecipeIngredientModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      title="Add Inventory Ingredient"
      onClose={onClose}
      footer={
        <div className="modal-actions">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onCreateIngredient}>
            Add Ingredient
          </Button>
        </div>
      }
    >
      <Input
        label="Ingredient name"
        placeholder="e.g. Chicken Thigh"
        value={ingredientForm.name}
        onChange={(event) => setIngredientForm((prev) => ({ ...prev, name: event.target.value }))}
        error={ingredientErrors.name}
      />
      <Select
        label="Ingredient type"
        value={ingredientForm.ingredientType}
        onChange={(event) =>
          setIngredientForm((prev) => ({
            ...prev,
            ingredientType: event.target.value as IngredientType,
          }))
        }
        options={INGREDIENT_TYPE_OPTIONS}
      />
      <Select
        label="Category"
        value={ingredientForm.category}
        onChange={(event) => setIngredientForm((prev) => ({ ...prev, category: event.target.value }))}
        options={ingredientCategoryOptions}
        error={ingredientErrors.category}
      />
      <Select
        label="Base unit"
        value={ingredientForm.baseUnit}
        onChange={(event) =>
          setIngredientForm((prev) => ({
            ...prev,
            baseUnit: event.target.value as IngredientBaseUnit,
          }))
        }
        options={INGREDIENT_BASE_UNIT_OPTIONS}
      />
      <Input
        label="On hand"
        inputMode="decimal"
        placeholder="0"
        value={ingredientForm.onHand}
        onChange={(event) => setIngredientForm((prev) => ({ ...prev, onHand: event.target.value }))}
        error={ingredientErrors.onHand}
      />
      <Input
        label="Reorder level"
        inputMode="decimal"
        placeholder="0"
        value={ingredientForm.reorderLevel}
        onChange={(event) => setIngredientForm((prev) => ({ ...prev, reorderLevel: event.target.value }))}
        error={ingredientErrors.reorderLevel}
      />
      <Input
        label="Unit cost"
        inputMode="decimal"
        placeholder="0.00"
        value={ingredientForm.unitCost}
        onChange={(event) => setIngredientForm((prev) => ({ ...prev, unitCost: event.target.value }))}
        error={ingredientErrors.unitCost}
      />
    </Modal>
  )
}

export default RecipeIngredientModal
