import { formatCurrency } from '../../../../shared/lib/format'
import type { KioskCartItem } from '../../kiosk.utils'
import { KIOSK_CART_COPY, KIOSK_CART_STYLES } from './cart.constants'
import type { KioskCartItemKeyHandler, KioskCartQuantityHandler } from './cart.types'

type KioskCartItemRowProps = {
  item: KioskCartItem
  onRemove: KioskCartItemKeyHandler
  onUpdateQuantity: KioskCartQuantityHandler
}

function KioskCartItemRow({
  item,
  onRemove,
  onUpdateQuantity,
}: KioskCartItemRowProps) {
  const { key, product, quantity } = item
  const lineTotal = product.price * quantity

  return (
    <article className={KIOSK_CART_STYLES.itemRow}>
      <div className="flex items-center justify-between gap-2">
        <h4 className="m-0 text-[14px] font-semibold text-body">{product.name}</h4>
        <button
          type="button"
          className={KIOSK_CART_STYLES.removeButton}
          onClick={() => onRemove(key)}
        >
          {KIOSK_CART_COPY.remove}
        </button>
      </div>
      <div className="mt-1 font-mono text-[12px] text-muted">
        {formatCurrency(product.price)} {KIOSK_CART_COPY.priceSuffix}
      </div>
      <div className="mt-2 grid grid-cols-[24px_auto_24px_1fr] items-center gap-2">
        <button
          type="button"
          className={KIOSK_CART_STYLES.quantityButton}
          onClick={() => onUpdateQuantity(key, quantity - 1)}
        >
          -
        </button>
        <span className={KIOSK_CART_STYLES.amountText}>{quantity}</span>
        <button
          type="button"
          className={KIOSK_CART_STYLES.quantityButton}
          onClick={() => onUpdateQuantity(key, quantity + 1)}
        >
          +
        </button>
        <strong className={`justify-self-end ${KIOSK_CART_STYLES.amountText}`}>
          {formatCurrency(lineTotal)}
        </strong>
      </div>
    </article>
  )
}

export default KioskCartItemRow
