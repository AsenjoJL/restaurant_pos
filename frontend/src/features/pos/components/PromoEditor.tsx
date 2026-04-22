import { useState } from 'react'
import Button from '../../../shared/components/ui/Button'
import Input from '../../../shared/components/ui/Input'

interface PromoEditorProps {
  initialValue: string
  promoHelperText?: string
  promoError?: string
  isApplied: boolean
  onApply: (value: string) => void
  onRemove: () => void
}

export function PromoEditor({
  initialValue,
  promoHelperText,
  promoError,
  isApplied,
  onApply,
  onRemove,
}: PromoEditorProps) {
  const [promoInput, setPromoInput] = useState(initialValue)

  return (
    <div className="promo-block">
      <Input
        label="Promo Code"
        placeholder="e.g. WELCOME10"
        value={promoInput}
        onChange={(event) => setPromoInput(event.target.value)}
        helperText={promoHelperText}
        error={promoError}
      />
      <div className="promo-actions">
        <Button variant="outline" onClick={() => onApply(promoInput)}>
          Apply Promo
        </Button>
        <Button variant="ghost" onClick={onRemove} disabled={!isApplied}>
          Remove Promo
        </Button>
      </div>
    </div>
  )
}
