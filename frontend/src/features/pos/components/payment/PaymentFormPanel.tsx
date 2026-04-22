import Input from '../../../../shared/components/ui/Input'
import { formatCurrency } from '../../../../shared/lib/format'
import type { PaymentMethod } from '../../../../shared/types/order'
import type { DerivedPaymentInputs } from '../../payment/payment.utils'

type PaymentFormPanelProps = {
  activeOrderId: string | null
  derived: DerivedPaymentInputs
  onMethodChange: (method: PaymentMethod) => void
  onAmountReceivedChange: (value: string) => void
  onCardReferenceChange: (value: string) => void
  onWalletReferenceChange: (value: string) => void
  onWalletPayerChange: (value: string) => void
}

function PaymentFormPanel({
  activeOrderId,
  derived,
  onMethodChange,
  onAmountReceivedChange,
  onCardReferenceChange,
  onWalletReferenceChange,
  onWalletPayerChange,
}: PaymentFormPanelProps) {
  return (
    <div className="payment-panel">
      <div className="payment-methods">
        {(['CASH', 'CARD', 'GCASH', 'OTHER'] as PaymentMethod[]).map((method) => (
          <button
            key={method}
            type="button"
            className={`payment-method${derived.paymentMethod === method ? ' is-active' : ''}`}
            onClick={() => {
              if (!activeOrderId) return
              onMethodChange(method)
            }}
            disabled={derived.paymentCaptured}
          >
            {method === 'CASH'
              ? 'Cash'
              : method === 'CARD'
                ? 'Card'
                : method === 'GCASH'
                  ? 'GCash'
                  : 'Other'}
          </button>
        ))}
      </div>
      <div className="payment-row">
        <span className="payment-label">Order total</span>
        <strong>{formatCurrency(derived.total)}</strong>
      </div>

      {derived.isCash ? (
        <>
          <Input
            label="Amount Received"
            placeholder="0.00"
            value={derived.amountReceived}
            onChange={(event) => onAmountReceivedChange(event.target.value)}
            inputMode="decimal"
            disabled={derived.paymentCaptured}
          />
          <div className="payment-row payment-change">
            <span>Change</span>
            <span>{formatCurrency(Math.max(derived.change, 0))}</span>
          </div>
          {derived.hasAmount && derived.change < 0 ? (
            <div className="payment-error">Insufficient amount</div>
          ) : null}
        </>
      ) : null}

      {derived.paymentMethod === 'CARD' ? (
        <Input
          label="Card reference (optional)"
          placeholder="Terminal ref or last 4 digits"
          value={derived.cardReference}
          onChange={(event) => onCardReferenceChange(event.target.value)}
          disabled={derived.paymentCaptured}
        />
      ) : null}

      {derived.paymentMethod === 'GCASH' || derived.paymentMethod === 'OTHER' ? (
        <>
          <Input
            label="Reference number"
            placeholder="Payment reference"
            value={derived.walletReference}
            onChange={(event) => onWalletReferenceChange(event.target.value)}
            disabled={derived.paymentCaptured}
            error={derived.missingReference ? 'Reference is required.' : undefined}
          />
          <Input
            label="Payer name (optional)"
            placeholder="Customer name"
            value={derived.walletPayer}
            onChange={(event) => onWalletPayerChange(event.target.value)}
            disabled={derived.paymentCaptured}
          />
        </>
      ) : null}
    </div>
  )
}

export default PaymentFormPanel

