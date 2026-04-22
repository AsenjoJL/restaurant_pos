import { MAX_NOTE_LENGTH } from '../../../../shared/lib/validators'
import { KIOSK_CART_COPY, KIOSK_CART_STYLES } from './cart.constants'
import type { KioskCartNoteChangeHandler } from './cart.types'

type KioskCartNoteFieldProps = {
  note: string
  onChange: KioskCartNoteChangeHandler
}

function KioskCartNoteField({ note, onChange }: KioskCartNoteFieldProps) {
  return (
    <label className="grid gap-1 mt-3">
      <span className={KIOSK_CART_STYLES.metaLabel}>{KIOSK_CART_COPY.orderNoteLabel}</span>
      <textarea
        placeholder={KIOSK_CART_COPY.orderNotePlaceholder}
        value={note}
        name="kioskOrderNote"
        onChange={(event) => onChange(event.target.value)}
        maxLength={MAX_NOTE_LENGTH}
        className="min-h-[78px] resize-y border border-divider rounded-[4px] p-3 text-[13px] font-sans bg-cream text-body"
      />
    </label>
  )
}

export default KioskCartNoteField
