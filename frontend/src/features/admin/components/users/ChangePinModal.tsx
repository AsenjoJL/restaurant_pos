import Button from '../../../../shared/components/ui/Button'
import Input from '../../../../shared/components/ui/Input'
import Modal from '../../../../shared/components/ui/Modal'
import type { AdminUser } from '../../admin.types'

type ChangePinModalProps = {
  confirmPassword: string
  error: string
  isOpen: boolean
  isSaving: boolean
  newPassword: string
  target: AdminUser | null
  onClose: () => void
  onConfirmPasswordChange: (value: string) => void
  onNewPasswordChange: (value: string) => void
  onSave: () => void
}

function ChangePinModal({
  confirmPassword,
  error,
  isOpen,
  isSaving,
  newPassword,
  target,
  onClose,
  onConfirmPasswordChange,
  onNewPasswordChange,
  onSave,
}: ChangePinModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      title={target ? `Change Password - ${target.username}` : 'Change Password'}
      onClose={onClose}
      className="admin-change-pin-modal"
      bodyClassName="admin-change-pin-modal-body"
      footerClassName="admin-change-pin-modal-footer"
      footer={
        <div className="modal-actions">
          <Button variant="ghost" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Password'}
          </Button>
        </div>
      }
    >
      {error ? <div className="form-error">{error}</div> : null}
      <Input
        label="New Password"
        placeholder="Enter new password"
        type="password"
        autoComplete="new-password"
        value={newPassword}
        onChange={(event) => onNewPasswordChange(event.target.value)}
        helperText="Use at least 8 characters."
        required
      />
      <Input
        label="Confirm Password"
        placeholder="Re-enter password"
        type="password"
        autoComplete="new-password"
        value={confirmPassword}
        onChange={(event) => onConfirmPasswordChange(event.target.value)}
        required
      />
    </Modal>
  )
}

export default ChangePinModal
