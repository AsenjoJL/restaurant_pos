import Button from '../../../shared/components/ui/Button'
import Modal from '../../../shared/components/ui/Modal'
import IngredientIdentityFields from './forms/IngredientIdentityFields'
import IngredientStockCostFields from './forms/IngredientStockCostFields'
import { type IngredientErrors, type IngredientFormState } from '../inventory.admin-form'

type IngredientModalProps = {
  isOpen: boolean
  isSaving: boolean
  isEditing: boolean
  form: IngredientFormState
  errors: IngredientErrors
  formError: string
  derivedUnitCost: number | null
  ingredientCategoryOptions: Array<{ value: string; label: string }>
  onClose: () => void
  onSave: () => void
  onFormChange: (next: IngredientFormState) => void
}

function IngredientModal({
  isOpen,
  isSaving,
  isEditing,
  form,
  errors,
  formError,
  derivedUnitCost,
  ingredientCategoryOptions,
  onClose,
  onSave,
  onFormChange,
}: IngredientModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      title={isEditing ? 'Edit Ingredient' : 'Add Ingredient'}
      onClose={onClose}
      className="inventory-ingredient-modal"
      bodyClassName="inventory-ingredient-modal-body"
      footerClassName="inventory-ingredient-modal-footer"
      footer={
        <div className="modal-actions">
          <Button variant="ghost" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Ingredient'}
          </Button>
        </div>
      }
    >
      {formError ? <div className="form-error">{formError}</div> : null}
      <IngredientIdentityFields
        errors={errors}
        form={form}
        ingredientCategoryOptions={ingredientCategoryOptions}
        onFormChange={onFormChange}
      />
      <IngredientStockCostFields
        derivedUnitCost={derivedUnitCost}
        errors={errors}
        form={form}
        onFormChange={onFormChange}
      />
    </Modal>
  )
}

export default IngredientModal
