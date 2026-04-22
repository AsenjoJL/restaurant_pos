import { KIOSK_CART_COPY, KIOSK_CART_STYLES } from './cart.constants'

function KioskCartEmptyState() {
  return (
    <div className={KIOSK_CART_STYLES.emptyState}>
      <div className={KIOSK_CART_STYLES.iconCircle}>
        <img className="w-5 h-5" src="/cart.png" alt="" aria-hidden="true" />
      </div>
      <p className="m-0 text-[15px] font-semibold text-body">{KIOSK_CART_COPY.emptyTitle}</p>
      <span className="text-[13px] text-muted">{KIOSK_CART_COPY.emptyDescription}</span>
    </div>
  )
}

export default KioskCartEmptyState
