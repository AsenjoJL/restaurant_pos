import { useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../app/store/hooks'
import Button from '../../../shared/components/ui/Button'
import Input from '../../../shared/components/ui/Input'
import Modal from '../../../shared/components/ui/Modal'
import { pushToast } from '../../../shared/store/ui.store'
import { selectAuthUser } from '../../auth/auth.selectors'
import { selectOrders, selectReplacementRequests } from '../../orders/orders.selectors'
import { reviewReplacementRequest } from '../../orders/orders.store'
import type { ReplacementRequest } from '../../../shared/types/order'

type ReviewState = {
  requestId: string | null
  reviewNote: string
  isOpen: boolean
}

function AdminReplacementsPage() {
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectAuthUser)
  const orders = useAppSelector(selectOrders)
  const requests = useAppSelector(selectReplacementRequests)

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

  const activeRequest: ReplacementRequest | null = review.requestId
    ? requests.find((item) => item.id === review.requestId) ?? null
    : null

  const activeOrder = activeRequest
    ? orders.find((item) => item.id === activeRequest.orderId) ?? null
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
          description: 'Only admins can approve replacements.',
          variant: 'error',
        }),
      )
      return
    }

    dispatch(
      reviewReplacementRequest({
        requestId: activeRequest.id,
        status: 'APPROVED',
        reviewNote: review.reviewNote.trim() || undefined,
        approvedBy: { id: user.id, name: user.name, role: user.role },
      }),
    )
    dispatch(
      pushToast({
        title: 'Replacement approved',
        description: `Replacement ticket sent to kitchen.`,
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
          description: 'Only admins can reject replacements.',
          variant: 'error',
        }),
      )
      return
    }

    dispatch(
      reviewReplacementRequest({
        requestId: activeRequest.id,
        status: 'REJECTED',
        reviewNote: review.reviewNote.trim() || undefined,
        approvedBy: { id: user.id, name: user.name, role: user.role },
      }),
    )
    dispatch(
      pushToast({
        title: 'Replacement rejected',
        description: `Replacement request rejected.`,
        variant: 'warning',
      }),
    )
    handleCloseReview()
  }

  return (
    <div className="page admin-page">
      <div className="page-header">
        <div>
          <h2>Replacement Requests</h2>
          <p className="muted">Approve or reject replacement/remake requests.</p>
        </div>
      </div>

      <div className="panel admin-card">
        <div className="admin-card-header">
          <h3>Pending Requests</h3>
          <span className="muted">{pendingRequests.length} pending</span>
        </div>
        <div className="admin-table">
          <div className="admin-table-head admin-table-row">
            <span>Order</span>
            <span>Items</span>
            <span>Reason</span>
            <span>Requested</span>
            <span>Actions</span>
          </div>
          {pendingRequests.map((request) => (
            <div key={request.id} className="admin-table-row">
              <span>{orders.find((item) => item.id === request.orderId)?.order_no ?? request.orderId}</span>
              <span>{request.items.reduce((sum, item) => sum + item.qty, 0)} item(s)</span>
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
            <span>Order</span>
            <span>Items</span>
            <span>Reviewed</span>
          </div>
          {historyRequests.map((request) => (
            <div key={request.id} className="admin-table-row">
              <span className="chip">{request.status}</span>
              <span>{orders.find((item) => item.id === request.orderId)?.order_no ?? request.orderId}</span>
              <span>{request.items.reduce((sum, item) => sum + item.qty, 0)} item(s)</span>
              <span className="muted">
                {request.approvedAt ? new Date(request.approvedAt).toLocaleString() : '—'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Modal
        isOpen={review.isOpen}
        title="Review Replacement Request"
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
              Approve Replacement
            </Button>
          </div>
        }
      >
        {!activeRequest || !activeOrder ? (
          <div className="empty-state">
            <h3>No request selected</h3>
            <p className="muted">Pick a request to review.</p>
          </div>
        ) : (
          <div className="replacement-modal">
            <div className="replacement-header">
              <div>
                <h3>Order {activeOrder.order_no}</h3>
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
              onChange={(event) =>
                setReview((prev) => ({ ...prev, reviewNote: event.target.value }))
              }
              placeholder="Add a note for approval or rejection"
            />
          </div>
        )}
      </Modal>
    </div>
  )
}

export default AdminReplacementsPage
