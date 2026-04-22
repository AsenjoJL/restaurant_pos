import { formatCurrency } from '../../../../shared/lib/format'
import type { KioskTotals } from '../../kiosk.utils'
import { KIOSK_CART_COPY, KIOSK_CART_STYLES } from './cart.constants'

type KioskCartTotalsCardProps = {
  totals: KioskTotals
}

function KioskCartTotalsCard({ totals }: KioskCartTotalsCardProps) {
  return (
    <div className={`mt-3 ${KIOSK_CART_STYLES.card}`}>
      <div className="flex justify-between text-[12px] text-muted">
        <span>{KIOSK_CART_COPY.subtotal}</span>
        <strong className="font-mono text-[12px] text-body font-medium">
          {formatCurrency(totals.subtotal)}
        </strong>
      </div>
      <div className="flex justify-between text-[12px] text-muted">
        <span>{KIOSK_CART_COPY.tax}</span>
        <strong className="font-mono text-[12px] text-body font-medium">
          {formatCurrency(totals.tax)}
        </strong>
      </div>
      <div className="h-[1.5px] my-2 bg-body" />
      <div className="flex justify-between items-end">
        <span className="text-[11px] uppercase tracking-[.08em] font-bold text-body">
          {KIOSK_CART_COPY.total}
        </span>
        <strong className="font-serif text-[30px] text-brand font-normal">
          {formatCurrency(totals.total)}
        </strong>
      </div>
    </div>
  )
}

export default KioskCartTotalsCard
