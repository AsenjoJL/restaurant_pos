import Button from '../../../../shared/components/ui/Button'
import Input from '../../../../shared/components/ui/Input'
import Modal from '../../../../shared/components/ui/Modal'
import type {
  CategoryErrors,
  CategoryFormState,
} from '../../admin.categories-form'

type CategoryEditorModalProps = {
  errors: CategoryErrors
  form: CategoryFormState
  formError: string
  isEditing: boolean
  isOpen: boolean
  isSaving: boolean
  onClose: () => void
  onDescriptionChange: (value: string) => void
  onNameChange: (value: string) => void
  onSave: () => void
}

function CategoryEditorModal({
  errors,
  form,
  formError,
  isEditing,
  isOpen,
  isSaving,
  onClose,
  onDescriptionChange,
  onNameChange,
  onSave,
}: CategoryEditorModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      title={isEditing ? 'Edit Category' : 'Add Category'}
      onClose={onClose}
      footer={
        <div className="modal-actions">
          <Button variant="ghost" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Category'}
          </Button>
        </div>
      }
    >
      {formError ? <div className="form-error">{formError}</div> : null}
      <Input
        label="Category name"
        placeholder="e.g. Burgers"
        value={form.name}
        onChange={(event) => onNameChange(event.target.value)}
        error={errors.name}
      />
      <label className="input-field">
        <span className="input-label">Description</span>
        <textarea
          className="textarea"
          placeholder="Short description (optional)"
          value={form.description}
          name="categoryDescription"
          onChange={(event) => onDescriptionChange(event.target.value)}
        />
      </label>
    </Modal>
  )
}

export default CategoryEditorModal
