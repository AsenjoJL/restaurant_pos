import Button from '../../../../shared/components/ui/Button'
import Modal from '../../../../shared/components/ui/Modal'
import { formatCurrency } from '../../../../shared/lib/format'
import OrderReceiptPreview from '../../../../shared/components/receipt/OrderReceiptPreview'
import OrderReceiptSheet from '../../../../shared/components/receipt/OrderReceiptSheet'
import usePaymentModalController from '../../payment/usePaymentModalController'
import PaymentFormPanel from '../payment/PaymentFormPanel'

function PaymentModal() {
  const {
    activeOrderId,
    canProcessPayment,
    derived,
    handleAmountReceivedChange,
    handleCardReferenceChange,
    handleClose,
    handleConfirm,
    handleMethodChange,
    handleWalletPayerChange,
    handleWalletReferenceChange,
    isProcessing,
    order,
    printOrderId,
    ui,
  } = usePaymentModalController()

  return (
    <Modal
      isOpen={ui.isPaymentOpen}
      title="Payment"
      onClose={handleClose}
      className="pos-modal pos-payment-modal"
      bodyClassName="pos-modal-body"
      footerClassName="pos-modal-footer"
      footer={
        <div className="modal-actions">
          <Button variant="ghost" onClick={handleClose}>
            {derived.paymentCaptured ? 'Done' : 'Cancel'}
          </Button>
          {derived.paymentCaptured && order ? null : (
            <Button
              variant="primary"
              disabled={
                !order ||
                !canProcessPayment ||
                isProcessing ||
                derived.isInsufficient ||
                derived.missingReference
              }
              onClick={handleConfirm}
              icon="payments"
            >
              Pay & Print
            </Button>
          )}
        </div>
      }
    >
      {!order ? (
        <div className="empty-state">
          <h3>No order loaded</h3>
          <p className="muted">Close and retry checkout.</p>
        </div>
      ) : (
        <div className="pos-payment-layout">
          <div className="pos-payment-summary">
            <p className="pos-modal-eyebrow">Order summary</p>
            <div className="pos-payment-summary-row">
              <span>Order</span>
              <strong>{order.order_no}</strong>
            </div>
            <div className="pos-payment-summary-row">
              <span>Source</span>
              <strong>{order.source}</strong>
            </div>
            <div className="pos-payment-summary-row">
              <span>Items</span>
              <strong>{order.items.length}</strong>
            </div>
            <div className="pos-payment-summary-row pos-payment-summary-total">
              <span>Total due</span>
              <strong>{formatCurrency(derived.total)}</strong>
            </div>
          </div>

          <PaymentFormPanel
            activeOrderId={activeOrderId}
            derived={derived}
            onMethodChange={handleMethodChange}
            onAmountReceivedChange={handleAmountReceivedChange}
            onCardReferenceChange={handleCardReferenceChange}
            onWalletReferenceChange={handleWalletReferenceChange}
            onWalletPayerChange={handleWalletPayerChange}
          />

          {derived.paymentCaptured ? (
            <div className="payment-receipt">
              <OrderReceiptPreview order={order} variant="receipt" />
            </div>
          ) : null}
        </div>
      )}

      {printOrderId && order ? (
        <OrderReceiptSheet order={order} variant="receipt" />
      ) : null}
    </Modal>
  )
}

export default PaymentModal
