import Button from '../../../../shared/components/ui/Button'
import { formatCurrency } from '../../../../shared/lib/format'
import type { CashAdjustmentRequest } from '../../../../shared/types/cash'

type AdjustmentRecord = {
  amount: number
  createdAt: string
  id: string
  relatedOrderId?: string
  type: string
}

type AdminCashAdjustmentsTablesProps = {
  adjustments: AdjustmentRecord[]
  historyRequests: CashAdjustmentRequest[]
  pendingRequests: CashAdjustmentRequest[]
  resolveOrderLabel: (orderId?: string) => string
  onReview: (requestId: string) => void
}

function AdminCashAdjustmentsTables({
  adjustments,
  historyRequests,
  pendingRequests,
  resolveOrderLabel,
  onReview,
}: AdminCashAdjustmentsTablesProps) {
  return (
    <>
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
                <Button variant="outline" onClick={() => onReview(request.id)}>
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
              <span className="muted">{new Date(adjustment.createdAt).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default AdminCashAdjustmentsTables
