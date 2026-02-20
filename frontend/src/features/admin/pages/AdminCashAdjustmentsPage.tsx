import { useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../app/store/hooks'
import Button from '../../../shared/components/ui/Button'
import Input from '../../../shared/components/ui/Input'
import Modal from '../../../shared/components/ui/Modal'
import { formatCurrency } from '../../../shared/lib/format'
import { pushToast } from '../../../shared/store/ui.store'
import { selectAuthUser } from '../../auth/auth.selectors'
import {
  selectCashAdjustmentRequests,
  selectCashAdjustments,
} from '../../cash/cash.selectors'
import { reviewCashAdjustmentRequest } from '../../cash/cash.store'
import { selectOrders } from '../../orders/orders.selectors'
import type { CashAdjustmentRequest } from '../../../shared/types/cash'

type ReviewState = {
  requestId: string | null
  reviewNote: string
  isOpen: boolean
}

function AdminCashAdjustmentsPage() {
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectAuthUser)
  const orders = useAppSelector(selectOrders)
  const requests = useAppSelector(selectCashAdjustmentRequests)
  const adjustments = useAppSelector(selectCashAdjustments)

  const [review, setReview] = useState<ReviewState>({
    requestId: null,
    reviewNote: '',
    isOpen: false,
  })

  const pendingRequests = useMemo(
    () => requests.filter((item) => item.status === 'PENDING'),
    [requests],
  )
  const historyRequests = useMemo(
    () => requests.filter((item) => item.status !== 'PENDING'),
    [requests],
  )

  const activeRequest: CashAdjustmentRequest | null = review.requestId
    ? requests.find((item) => item.id === review.requestId) ?? null
    : null

  const handleOpenReview = (requestId: string) => {
    setReview({ requestId, reviewNote: '', isOpen: true })
  }

  const handleCloseReview = () => {
    setReview({ requestId: null, reviewNote: '', isOpen: false })
  }

  const handleApprove = () => {
    if (!activeRequest || !user) {
      return
    }
    if (user.role !== 'admin') {
      dispatch(
        pushToast({
          title: 'Admin only',
          description: 'Only admins can approve adjustments.',
          variant: 'error',
        }),
      )
      return
    }
    dispatch(
      reviewCashAdjustmentRequest({
        requestId: activeRequest.id,
        status: 'APPROVED',
        reviewNote: review.reviewNote.trim() || undefined,
        reviewedBy: { id: user.id, name: user.name, role: user.role },
      }),
    )
    dispatch(
      pushToast({
        title: 'Adjustment approved',
        description: 'Cash adjustment recorded.',
        variant: 'success',
      }),
    )
    handleCloseReview()
  }

  const handleReject = () => {
    if (!activeRequest || !user) {
      return
    }
    if (user.role !== 'admin') {
      dispatch(
        pushToast({
          title: 'Admin only',
          description: 'Only admins can reject adjustments.',
          variant: 'error',
        }),
      )
      return
    }
    dispatch(
      reviewCashAdjustmentRequest({
        requestId: activeRequest.id,
        status: 'REJECTED',
        reviewNote: review.reviewNote.trim() || undefined,
        reviewedBy: { id: user.id, name: user.name, role: user.role },
      }),
    )
    dispatch(
      pushToast({
        title: 'Adjustment rejected',
        description: 'Request was rejected.',
        variant: 'warning',
      }),
    )
    handleCloseReview()
  }

  const resolveOrderLabel = (orderId?: string) => {
    if (!orderId) {
      return '—'
    }
    const order = orders.find((item) => item.id === orderId)
    return order?.order_no ?? orderId
  }

  return (
    <div className="page admin-page">
      <div className="page-header">
        <div>
          <h2>Cash Adjustments</h2>
          <p className="muted">Review wrong change reports and keep a history log.</p>
        </div>
      </div>

      <div className="panel admin-card">
        <div className="admin-card-header">
          <h3>Pending Requests</h3>
          <span className="muted">{pendingRequests.length} pending</span>
        </div>
        <div className="admin-table">
          <div className="admin-table-head admin-table-row">
            <span>Type</span>
            <span>Amount</span>
            <span>Order</span>
            <span>Reason</span>
            <span>Requested</span>
            <span>Actions</span>
          </div>
          {pendingRequests.map((request) => (
            <div key={request.id} className="admin-table-row">
              <span>{request.type}</span>
              <span>{formatCurrency(request.amount)}</span>
              <span>{resolveOrderLabel(request.relatedOrderId)}</span>
              <span className="muted">{request.reason}</span>
              <span className="muted">{new Date(request.requestedAt).toLocaleString()}</span>
              <div className="admin-row-actions">
                <Button variant="outline" onClick={() => handleOpenReview(request.id)}>
                  Review
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel admin-card">
        <div className="admin-card-header">
          <h3>History</h3>
          <span className="muted">{historyRequests.length} records</span>
        </div>
        <div className="admin-table">
          <div className="admin-table-head admin-table-row">
            <span>Status</span>
            <span>Type</span>
            <span>Amount</span>
            <span>Order</span>
            <span>Reviewed</span>
          </div>
          {historyRequests.map((request) => (
            <div key={request.id} className="admin-table-row">
              <span className="chip">{request.status}</span>
              <span>{request.type}</span>
              <span>{formatCurrency(request.amount)}</span>
              <span>{resolveOrderLabel(request.relatedOrderId)}</span>
              <span className="muted">
                {request.reviewedAt ? new Date(request.reviewedAt).toLocaleString() : '—'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="panel admin-card">
        <div className="admin-card-header">
          <h3>Approved Adjustments</h3>
          <span className="muted">{adjustments.length} entries</span>
        </div>
        <div className="admin-table">
          <div className="admin-table-head admin-table-row">
            <span>Type</span>
            <span>Amount</span>
            <span>Order</span>
            <span>Processed</span>
          </div>
          {adjustments.map((adjustment) => (
            <div key={adjustment.id} className="admin-table-row">
              <span>{adjustment.type}</span>
              <span>{formatCurrency(adjustment.amount)}</span>
              <span>{resolveOrderLabel(adjustment.relatedOrderId)}</span>
              <span className="muted">
                {new Date(adjustment.createdAt).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Modal
        isOpen={review.isOpen}
        title="Review Cash Adjustment"
        onClose={handleCloseReview}
        footer={
          <div className="modal-actions">
            <Button variant="ghost" onClick={handleCloseReview}>
              Close
            </Button>
            <Button variant="danger" onClick={handleReject}>
              Reject
            </Button>
            <Button variant="primary" onClick={handleApprove}>
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
              <div className="cash-adjustment-total">
                {formatCurrency(activeRequest.amount)}
              </div>
            </div>
            <Input
              label="Review note (optional)"
              value={review.reviewNote}
              onChange={(event) =>
                setReview((prev) => ({ ...prev, reviewNote: event.target.value }))
              }
              placeholder="Add an approval or rejection note"
            />
          </div>
        )}
      </Modal>
    </div>
  )
}

export default AdminCashAdjustmentsPage
