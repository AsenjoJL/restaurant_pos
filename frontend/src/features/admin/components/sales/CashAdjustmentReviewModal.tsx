import Button from '../../../../shared/components/ui/Button'
import Input from '../../../../shared/components/ui/Input'
import Modal from '../../../../shared/components/ui/Modal'
import { formatCurrency } from '../../../../shared/lib/format'
import type { CashAdjustmentRequest } from '../../../../shared/types/cash'
import type { AdminReviewState } from '../../admin.sales-center'

type CashAdjustmentReviewModalProps = {
  activeRequest: CashAdjustmentRequest | null
  review: AdminReviewState
  setReview: React.Dispatch<React.SetStateAction<AdminReviewState>>
  onApprove: () => void
  onClose: () => void
  onReject: () => void
}

function CashAdjustmentReviewModal({
  activeRequest,
  review,
  setReview,
  onApprove,
  onClose,
  onReject,
}: CashAdjustmentReviewModalProps) {
  return (
    <Modal
      isOpen={review.isOpen}
      title="Review Cash Adjustment"
      onClose={onClose}
      className="cash-adjustment-review-modal"
      bodyClassName="cash-adjustment-review-body"
      footerClassName="cash-adjustment-review-footer"
      footer={
        <div className="modal-actions">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          <Button variant="danger" onClick={onReject}>
            Reject
          </Button>
          <Button variant="primary" onClick={onApprove}>
            Approve
          </Button>
        </div>
      }
    >
      {!activeRequest ? (
        <div className="empty-state">
          <h3>No request selected</h3>
          <p className="muted">Pick a request to review.</p>
        </div>
      ) : (
        <div className="cash-adjustment-review">
          <div className="cash-adjustment-summary">
            <div>
              <h3>{activeRequest.type}</h3>
              <p className="muted">{activeRequest.reason}</p>
            </div>
            <div className="cash-adjustment-total">{formatCurrency(activeRequest.amount)}</div>
          </div>
          <Input
            label="Review note (optional)"
            value={review.reviewNote}
            onChange={(event) => setReview((prev) => ({ ...prev, reviewNote: event.target.value }))}
            placeholder="Add an approval or rejection note"
          />
        </div>
      )}
    </Modal>
  )
}

export default CashAdjustmentReviewModal
