import type { Dispatch, SetStateAction } from 'react'
import Button from '../../../../shared/components/ui/Button'
import Input from '../../../../shared/components/ui/Input'
import Modal from '../../../../shared/components/ui/Modal'
import type { ReplacementRequest } from '../../../../shared/types/order'
import type { AdminReviewState } from '../../admin.sales-center'

type ReplacementReviewModalProps = {
  activeOrderNo: string | null
  activeRequest: ReplacementRequest | null
  review: AdminReviewState
  setReview: Dispatch<SetStateAction<AdminReviewState>>
  onApprove: () => void
  onClose: () => void
  onReject: () => void
}

function ReplacementReviewModal({
  activeOrderNo,
  activeRequest,
  review,
  setReview,
  onApprove,
  onClose,
  onReject,
}: ReplacementReviewModalProps) {
  return (
    <Modal
      isOpen={review.isOpen}
      title="Review Replacement Request"
      onClose={onClose}
      className="replacement-review-modal"
      bodyClassName="replacement-review-body"
      footerClassName="replacement-review-footer"
      footer={
        <div className="modal-actions">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          <Button variant="danger" onClick={onReject}>
            Reject
          </Button>
          <Button variant="primary" onClick={onApprove}>
            Approve Replacement
          </Button>
        </div>
      }
    >
      {!activeRequest || !activeOrderNo ? (
        <div className="empty-state">
          <h3>No request selected</h3>
          <p className="muted">Pick a request to review.</p>
        </div>
      ) : (
        <div className="replacement-modal">
          <div className="replacement-header">
            <div>
              <h3>Order {activeOrderNo}</h3>
              <p className="muted">{activeRequest.reason}</p>
            </div>
            <span className="replacement-pill">REMAKE / REPLACEMENT</span>
          </div>

          <div className="replacement-items">
            {activeRequest.items.map((item) => (
              <div key={item.productId} className="replacement-item-row">
                <div>
                  <strong>{item.name}</strong>
                  <span className="muted">Qty {item.qty}</span>
                </div>
              </div>
            ))}
          </div>

          <Input
            label="Review note (optional)"
            value={review.reviewNote}
            onChange={(event) => setReview((prev) => ({ ...prev, reviewNote: event.target.value }))}
            placeholder="Add a note for approval or rejection"
          />
        </div>
      )}
    </Modal>
  )
}

export default ReplacementReviewModal
