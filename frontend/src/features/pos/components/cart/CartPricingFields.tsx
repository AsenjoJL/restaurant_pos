import Input from '../../../../shared/components/ui/Input'
import { PromoEditor } from '../PromoEditor'
import type { PromoEvaluation } from '../../promo.engine'

type CartPricingFieldsProps = {
  discountValue: string
  onApplyPromo: (value: string) => void
  onDiscountChange: (value: string) => void
  onRemovePromo: () => void
  orderId: string
  promo: PromoEvaluation | null
  promoCode: string | null
}

function CartPricingFields({
  discountValue,
  onApplyPromo,
  onDiscountChange,
  onRemovePromo,
  orderId,
  promo,
  promoCode,
}: CartPricingFieldsProps) {
  return (
    <div className="order-footer-fields">
      <Input
        label="Discount (optional)"
        type="number"
        min="0"
        step="0.01"
        placeholder="0.00"
        value={discountValue}
        onChange={(event) => onDiscountChange(event.target.value)}
        helperText="Apply promo or manual discount (optional)"
      />

      <PromoEditor
        key={`${orderId}:${promoCode ?? ''}`}
        initialValue={promoCode ?? ''}
        promoHelperText={
          promo
            ? promo.isValid
              ? `${promo.label} applied`
              : promo.reason ?? 'Promo is invalid.'
            : 'Enter a promo code and click Apply.'
        }
        promoError={promo && !promo.isValid ? promo.reason : undefined}
        isApplied={Boolean(promoCode)}
        onApply={onApplyPromo}
        onRemove={onRemovePromo}
      />
    </div>
  )
}

export default CartPricingFields
