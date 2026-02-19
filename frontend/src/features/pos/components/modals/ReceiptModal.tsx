import { useAppDispatch, useAppSelector } from '../../../../app/store/hooks'
import Button from '../../../../shared/components/ui/Button'
import Modal from '../../../../shared/components/ui/Modal'
import { closeReceiptModal } from '../../pos.store'
import { selectDraft, selectPosUi, selectTotals } from '../../pos.selectors'
import { formatCurrency } from '../../../../shared/lib/format'

function ReceiptModal() {
  const dispatch = useAppDispatch()
  const ui = useAppSelector(selectPosUi)
  const draft = useAppSelector(selectDraft)
  const totals = useAppSelector(selectTotals)

  return (
    <Modal
      isOpen={ui.isReceiptOpen}
      title="Receipt Preview"
      onClose={() => dispatch(closeReceiptModal())}
      footer={
        <div className="modal-actions">
          <Button variant="ghost" onClick={() => dispatch(closeReceiptModal())}>
            Close
          </Button>
          <Button variant="primary">Print Receipt</Button>
        </div>
      }
    >
      <div className="receipt-preview">
        <div className="receipt-header">
          <h3>Restaurant POS</h3>
          <p className="muted">Order {draft.id}</p>
        </div>
        <div className="receipt-items">
          {draft.items.map((item) => {
            const unitPrice = item.finalUnitPrice ?? item.product.price
            return (
              <div key={item.product.id} className="receipt-row">
                <span>{item.product.name}</span>
                <span>
                  {item.quantity} × {formatCurrency(unitPrice)}
                </span>
              </div>
            )
          })}
        </div>
        <div className="receipt-total">
          <span>Total</span>
          <span>{formatCurrency(totals.total)}</span>
        </div>
      </div>
    </Modal>
  )
}

export default ReceiptModal
