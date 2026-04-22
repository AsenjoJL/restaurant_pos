import Button from '../../../shared/components/ui/Button'
import Modal from '../../../shared/components/ui/Modal'
import { formatCurrency } from '../../../shared/lib/format'
import type { SalesRecord } from '../../../shared/types/sales'

type SalesRecordDetailsModalProps = {
  record: SalesRecord | null
  onClose: () => void
  onPrint: (recordId: string) => void
}

function SalesRecordDetailsModal({ record, onClose, onPrint }: SalesRecordDetailsModalProps) {
  return (
    <Modal
      isOpen={Boolean(record)}
      title="Order Details"
      onClose={onClose}
      className="sales-order-details-modal"
      bodyClassName="sales-order-details-body"
      footerClassName="sales-order-details-footer"
      footer={
        <div className="modal-actions">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          {record ? (
            <Button variant="outline" onClick={() => onPrint(record.id)}>
              Print
            </Button>
          ) : null}
        </div>
      }
    >
      {record ? (
        <div className="sales-order-modal">
          <div className="sales-order-meta">
            <p>
              <strong>Order:</strong> {record.orderNo}
            </p>
            <p>
              <strong>Cashier:</strong> {record.processedBy?.name ?? '—'}
            </p>
            <p>
              <strong>Paid At:</strong> {new Date(record.paidAt).toLocaleString()}
            </p>
          </div>
          <div className="sales-order-items">
            <div className="sales-order-items-head">
              <span>Item</span>
              <span>Qty</span>
              <span>Price</span>
              <span>Total</span>
            </div>
            {record.items.map((item) => (
              <div key={`${record.id}-${item.id}-${item.name}`} className="sales-order-item">
                <div>
                  <strong>{item.name}</strong>
                  {item.modifiers && item.modifiers.length > 0 ? (
                    <p className="muted">{item.modifiers.join(', ')}</p>
                  ) : null}
                </div>
                <span>{item.quantity}</span>
                <span>{formatCurrency(item.price)}</span>
                <span>{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="sales-order-summary">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{formatCurrency(record.subtotal)}</span>
            </div>
            <div className="summary-row">
              <span>Tax</span>
              <span>{formatCurrency(record.tax)}</span>
            </div>
            <div className="summary-row">
              <span>Discount</span>
              <span>{formatCurrency(record.discount ?? 0)}</span>
            </div>
            <div className="summary-total">
              <span>Total</span>
              <span>{formatCurrency(record.total)}</span>
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  )
}

export default SalesRecordDetailsModal
