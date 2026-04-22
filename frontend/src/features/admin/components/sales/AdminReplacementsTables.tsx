import Button from '../../../../shared/components/ui/Button'
import type { ReplacementRequest } from '../../../../shared/types/order'

type AdminReplacementsTablesProps = {
  historyRequests: ReplacementRequest[]
  pendingRequests: ReplacementRequest[]
  resolveOrderLabel: (orderId: string) => string
  resolveItemCount: (request: ReplacementRequest) => number
  onReview: (requestId: string) => void
}

function AdminReplacementsTables({
  historyRequests,
  pendingRequests,
  resolveItemCount,
  resolveOrderLabel,
  onReview,
}: AdminReplacementsTablesProps) {
  return (
    <>
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
              <span>{resolveOrderLabel(request.orderId)}</span>
              <span>{resolveItemCount(request)} item(s)</span>
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
            <span>Order</span>
            <span>Items</span>
            <span>Reviewed</span>
          </div>
          {historyRequests.map((request) => (
            <div key={request.id} className="admin-table-row">
              <span className="chip">{request.status}</span>
              <span>{resolveOrderLabel(request.orderId)}</span>
              <span>{resolveItemCount(request)} item(s)</span>
              <span className="muted">
                {request.approvedAt ? new Date(request.approvedAt).toLocaleString() : '—'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default AdminReplacementsTables
