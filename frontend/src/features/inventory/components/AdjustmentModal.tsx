import Button from '../../../shared/components/ui/Button'
import Modal from '../../../shared/components/ui/Modal'
import AdjustmentDetailsFields from './forms/AdjustmentDetailsFields'
import { type AdjustErrors, type AdjustFormState } from '../inventory.admin-form'
import { updateAdjustmentReasonType } from '../inventory.adjustments'
import type { InventoryAdjustment } from '../inventory.types'

type AdjustmentModalProps = {
  isOpen: boolean
  isSaving: boolean
  form: AdjustFormState
  errors: AdjustErrors
  ingredientOptions: Array<{ value: string; label: string }>
  adjustments: Array<Pick<InventoryAdjustment, 'reference'>>
  onClose: () => void
  onSave: () => void
  onFormChange: (next: AdjustFormState) => void
}

function AdjustmentModal({
  isOpen,
  isSaving,
  form,
  errors,
  ingredientOptions,
  adjustments,
  onClose,
  onSave,
  onFormChange,
}: AdjustmentModalProps) {
  const handleReasonTypeChange = (reasonType: AdjustFormState['reasonType']) => {
    onFormChange(
      updateAdjustmentReasonType({
        adjustments,
        form,
        nextReasonType: reasonType,
      }),
    )
  }

  return (
    <Modal
      isOpen={isOpen}
      title="Stock Adjustment"
      onClose={onClose}
      className="inventory-adjustment-modal"
      bodyClassName="inventory-adjustment-modal-body"
      footerClassName="inventory-adjustment-modal-footer"
      footer={
        <div className="modal-actions">
          <Button variant="ghost" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onSave} disabled={isSaving}>
            Apply Adjustment
          </Button>
        </div>
      }
    >
      <AdjustmentDetailsFields
        errors={errors}
        form={form}
        ingredientOptions={ingredientOptions}
        onFormChange={onFormChange}
        onReasonTypeChange={handleReasonTypeChange}
      />
    </Modal>
  )
}

export default AdjustmentModal
