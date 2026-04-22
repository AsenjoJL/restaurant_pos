import Button from '../../../shared/components/ui/Button'
import Input from '../../../shared/components/ui/Input'
import Modal from '../../../shared/components/ui/Modal'
import Select from '../../../shared/components/ui/Select'
import { CASH_ADJUSTMENT_TYPE_OPTIONS } from '../cash.ui'
import useCashAdjustmentController from '../hooks/useCashAdjustmentController'

type CashAdjustmentModalProps = {
  isOpen: boolean
  onClose: () => void
}

function CashAdjustmentModal({ isOpen, onClose }: CashAdjustmentModalProps) {
  const {
    amount,
    canSubmit,
    isProcessing,
    orderOptions,
    reason,
    relatedOrderId,
    type,
    setAmount,
    setReason,
    setRelatedOrderId,
    setType,
    reset,
    handleSubmit,
  } = useCashAdjustmentController()

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      title="Report Wrong Change"
      onClose={handleClose}
      footer={
        <div className="modal-actions">
          <Button variant="ghost" onClick={handleClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              if (handleSubmit()) {
                onClose()
              }
            }}
            disabled={!canSubmit}
            icon="report"
          >
            Submit Report
          </Button>
        </div>
      }
    >
      <div className="cash-adjustment-modal">
        <div className="cash-adjustment-type">
          {CASH_ADJUSTMENT_TYPE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`cash-adjustment-toggle${type === option.value ? ' is-active' : ''}`}
              onClick={() => setType(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <Input
          label="Amount"
          type="number"
          min="0"
          step="0.01"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          placeholder="0.00"
        />

        <Select
          label="Related order (optional)"
          value={relatedOrderId}
          options={orderOptions}
          onChange={(event) => setRelatedOrderId(event.target.value)}
        />

        <label className="input-field">
          <span className="input-label">Reason</span>
          <textarea
            className="textarea"
            placeholder="Explain what happened"
            value={reason}
            name="cashAdjustmentReason"
            onChange={(event) => setReason(event.target.value)}
            maxLength={250}
          />
        </label>
      </div>
    </Modal>
  )
}

export default CashAdjustmentModal
