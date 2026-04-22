import { formatCurrency } from '../../../../shared/lib/format'
import type { PromoEvaluation } from '../../promo.engine'

type CartSummaryProps = {
  discount: number
  promo: PromoEvaluation | null
  totals: {
    discount: number
    service: number
    subtotal: number
    tax: number
    total: number
  }
}

function CartSummary({ discount, promo, totals }: CartSummaryProps) {
  const promoDiscount = promo?.isValid ? promo.discount : 0

  return (
    <div className="cart-summary">
      <div className="summary-row">
        <span>Subtotal</span>
        <span>{formatCurrency(totals.subtotal)}</span>
      </div>
      {promoDiscount > 0 ? (
        <div className="summary-row">
          <span>Promo ({promo?.code})</span>
          <span>- {formatCurrency(promoDiscount)}</span>
        </div>
      ) : null}
      <div className="summary-row">
        <span>Discount</span>
        <span>- {formatCurrency(discount)}</span>
      </div>
      <div className="summary-row">
        <span>Service</span>
        <span>{formatCurrency(totals.service)}</span>
      </div>
      <div className="summary-row">
        <span>Tax</span>
        <span>{formatCurrency(totals.tax)}</span>
      </div>
      <div className="summary-total">
        <span>Total</span>
        <span>{formatCurrency(totals.total)}</span>
      </div>
    </div>
  )
}

export default CartSummary
