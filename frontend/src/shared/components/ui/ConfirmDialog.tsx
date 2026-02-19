import Modal from './Modal'
import Button from './Button'
import Input from './Input'

type ConfirmDialogProps = {
  isOpen: boolean
  title: string
  description: string
  reason: string
  requireReason?: boolean
  onReasonChange: (value: string) => void
  onConfirm: () => void
  onCancel: () => void
  confirmLabel?: string
}

function ConfirmDialog({
  isOpen,
  title,
  description,
  reason,
  requireReason = false,
  onReasonChange,
  onConfirm,
  onCancel,
  confirmLabel = 'Confirm',
}: ConfirmDialogProps) {
  return (
    <Modal
      isOpen={isOpen}
      title={title}
      onClose={onCancel}
      footer={
        <div className="modal-actions">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            disabled={requireReason && reason.trim().length === 0}
          >
            {confirmLabel}
          </Button>
        </div>
      }
    >
      <p className="muted">{description}</p>
      {requireReason ? (
        <Input
          label="Reason"
          placeholder="Enter a reason"
          value={reason}
          onChange={(event) => onReasonChange(event.target.value)}
        />
      ) : null}
    </Modal>
  )
}

export default ConfirmDialog
