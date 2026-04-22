import type { CartItem } from '../../pos.types'
import { formatCurrency } from '../../../../shared/lib/format'

type CartItemRowProps = {
  item: CartItem
  onIncrease: () => void
  onDecrease: () => void
  onVoid: () => void
  onOpenModifiers: () => void
  onNoteChange: (value: string) => void
}

function CartItemRow({
  item,
  onIncrease,
  onDecrease,
  onVoid,
  onOpenModifiers,
  onNoteChange,
}: CartItemRowProps) {
  const isBundle = item.product.type === 'BUNDLE'
  const hasModifiers = !isBundle && Boolean(item.product.modifierGroups?.length)
  const unitPrice = item.finalUnitPrice ?? item.product.price

  return (
    <div className="cart-item">
      <div className="cart-item-info">
        <div className="cart-item-copy">
          <span className="cart-item-qty-badge">{item.quantity}</span>
          <div className="cart-item-copy-body">
            <h4>{item.product.name}</h4>
            <p className="muted">{formatCurrency(unitPrice)} each</p>
            {isBundle && item.bundleSelections?.length ? (
              <div className="bundle-summary">
                {item.bundleSelections.map((selection) => (
                  <span key={`${selection.groupId}-${selection.productId}`}>
                    {selection.groupLabel}: {selection.name}
                  </span>
                ))}
              </div>
            ) : null}
            {item.selectedModifiers.length > 0 ? (
              <p className="muted modifier-list">
                Mods: {item.selectedModifiers.map((mod) => mod.name).join(', ')}
              </p>
            ) : null}
          </div>
        </div>
        <div className="cart-item-inline-actions">
          <span className="line-total">{formatCurrency(unitPrice * item.quantity)}</span>
          <button type="button" className="link-btn" onClick={onVoid}>
            Void
          </button>
        </div>
      </div>
      <div className="cart-item-actions">
        <div className="qty-control">
          <button type="button" className="icon-btn" onClick={onDecrease} aria-label="Decrease">
            -
          </button>
          <span>{item.quantity}</span>
          <button type="button" className="icon-btn" onClick={onIncrease} aria-label="Increase">
            +
          </button>
        </div>
        <button
          type="button"
          className="btn btn-outline cart-item-modifiers-btn"
          onClick={onOpenModifiers}
          disabled={!hasModifiers}
        >
          Modifiers
        </button>
      </div>
      <div className="cart-item-meta">
        <label className="note-field">
          <span className="input-label">Note</span>
          <textarea
            className="textarea"
            placeholder="Add item note"
            value={item.note ?? ''}
            name={`itemNote-${item.product.id}`}
            onChange={(event) => onNoteChange(event.target.value)}
            maxLength={250}
          />
        </label>
      </div>
    </div>
  )
}

export default CartItemRow
