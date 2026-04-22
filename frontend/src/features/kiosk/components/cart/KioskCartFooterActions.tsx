import { KIOSK_CART_COPY, KIOSK_CART_STYLES } from './cart.constants'

type KioskCartFooterActionsProps = {
  clearDisabled: boolean
  isEmpty: boolean
  isPlacing: boolean
  onClearCart: () => void
  onPlaceOrder: () => void
}

function KioskCartFooterActions({
  clearDisabled,
  isEmpty,
  isPlacing,
  onClearCart,
  onPlaceOrder,
}: KioskCartFooterActionsProps) {
  const clearCartClassName = `${KIOSK_CART_STYLES.actionButtonBase} border border-divider text-body`
  const placeOrderClassName = `${KIOSK_CART_STYLES.actionButtonBase} border border-brand bg-brand text-paper disabled:bg-[#C8BCA8] disabled:text-[#837a68] disabled:border-[#C8BCA8]`

  return (
    <div className="p-3 border-t border-divider grid gap-2 bg-paper">
      <button
        type="button"
        className={clearCartClassName}
        onClick={onClearCart}
        disabled={clearDisabled}
      >
        {KIOSK_CART_COPY.clearCart}
      </button>
      <button
        type="button"
        className={placeOrderClassName}
        onClick={onPlaceOrder}
        disabled={isEmpty || isPlacing}
      >
        {KIOSK_CART_COPY.placeOrder}
      </button>
    </div>
  )
}

export default KioskCartFooterActions
