import Button from '../../../../shared/components/ui/Button'
import Input from '../../../../shared/components/ui/Input'
import Modal from '../../../../shared/components/ui/Modal'
import Select from '../../../../shared/components/ui/Select'
import type { AdminUser } from '../../admin.types'
import type { UserErrors, UserFormState } from '../../admin.users-form'

type UserFormModalProps = {
  errors: UserErrors
  form: UserFormState
  formError: string
  isOpen: boolean
  isSaving: boolean
  isEditing: boolean
  roleOptions: Array<{ value: string; label: string }>
  onClose: () => void
  onFormChange: (next: UserFormState) => void
  onSave: () => void
}

function UserFormModal({
  errors,
  form,
  formError,
  isOpen,
  isSaving,
  isEditing,
  roleOptions,
  onClose,
  onFormChange,
  onSave,
}: UserFormModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      title={isEditing ? 'Edit Staff User' : 'Add Staff User'}
      onClose={onClose}
      className="admin-user-form-modal"
      bodyClassName="admin-user-form-modal-body"
      footerClassName="admin-user-form-modal-footer"
      footer={
        <div className="modal-actions">
          <Button variant="ghost" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save User'}
          </Button>
        </div>
      }
    >
      {formError ? <div className="form-error">{formError}</div> : null}
      <Input
        label="Full name"
        placeholder="e.g. Ava Admin"
        value={form.name}
        onChange={(event) => onFormChange({ ...form, name: event.target.value })}
        error={errors.name}
      />
      <Input
        label="Username"
        placeholder="e.g. cashier01"
        value={form.username}
        onChange={(event) => onFormChange({ ...form, username: event.target.value })}
        error={errors.username}
      />
      <Select
        label="Role"
        value={form.role}
        onChange={(event) =>
          onFormChange({ ...form, role: event.target.value as AdminUser['role'] })
        }
        options={roleOptions}
        error={errors.role}
      />
    </Modal>
  )
}

export default UserFormModal
