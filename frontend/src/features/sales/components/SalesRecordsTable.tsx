import Button from '../../../shared/components/ui/Button'
import { formatCurrency } from '../../../shared/lib/format'
import type { SalesRecord } from '../../../shared/types/sales'
import type { SalesUiStatus } from '../useAdminSalesModel'

type SalesRecordsTableProps = {
  records: SalesRecord[]
  getUiStatus: (orderId: string) => SalesUiStatus
  onSelect: (recordId: string) => void
  onPrint: (recordId: string) => void
}

function SalesRecordsTable({
  records,
  getUiStatus,
  onSelect,
  onPrint,
}: SalesRecordsTableProps) {
  return (
    <div className="panel admin-card">
      <div className="admin-table admin-table-sales-records">
        <div className="admin-table-head sales-records">
          <span>Order ID</span>
          <span>Date & Time</span>
          <span>Cashier</span>
          <span>Payment Method</span>
          <span>Total</span>
          <span>Tax</span>
          <span>COGS</span>
          <span>Profit</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        {records.length === 0 ? (
          <div className="empty-state">
            <h3>No sales found</h3>
            <p className="muted">Try adjusting your filters.</p>
          </div>
        ) : (
          records.map((record) => {
            const cogs = record.cogs ?? 0
            const profit = record.grossProfit ?? record.total - cogs
            const status = getUiStatus(record.orderId)

            return (
              <div
                key={record.id}
                className="admin-table-row sales-records"
                role="button"
                tabIndex={0}
                onClick={() => onSelect(record.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    onSelect(record.id)
                  }
                }}
              >
                <div className="admin-cell-title">
                  <strong>{record.orderNo}</strong>
                </div>
                <span>{new Date(record.paidAt).toLocaleString()}</span>
                <span>{record.processedBy?.name ?? '—'}</span>
                <span>{record.paymentMethod}</span>
                <span className="admin-price">{formatCurrency(record.total)}</span>
                <span className="admin-price">{formatCurrency(record.tax)}</span>
                <span className="admin-price">{formatCurrency(cogs)}</span>
                <span className="admin-price">{formatCurrency(profit)}</span>
                <span className={`sales-status-pill sales-status-pill--${status.toLowerCase()}`}>
                  {status}
                </span>
                <div className="admin-row-actions sales-row-actions" onClick={(event) => event.stopPropagation()}>
                  <Button
                    variant="outline"
                    className="sales-action-btn sales-action-view"
                    onClick={() => onSelect(record.id)}
                  >
                    View
                  </Button>
                  <Button
                    variant="outline"
                    className="sales-action-btn sales-action-print"
                    onClick={() => onPrint(record.id)}
                  >
                    Print
                  </Button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default SalesRecordsTable
