import { formatCurrency } from '../../../shared/lib/format'
import type { KioskCartItem, KioskTotals } from '../kiosk.utils'
import {
  KioskCartEmptyState,
  KioskCartFooterActions,
  KioskCartItemRow,
  KioskCartNoteField,
  KioskCartTotalsCard,
} from './cart'

type KioskMenuCartPanelProps = {
  cart: KioskCartItem[]
  clearDisabled: boolean
  isPlacing: boolean
  note: string
  totals: KioskTotals
  onClearCart: () => void
  onNoteChange: (value: string) => void
  onPlaceOrder: () => void
  onRemoveItem: (key: string) => void
  onUpdateQuantity: (key: string, quantity: number) => void
}

function KioskMenuCartPanel({
  cart,
  clearDisabled,
  isPlacing,
  note,
  totals,
  onClearCart,
  onNoteChange,
  onPlaceOrder,
  onRemoveItem,
  onUpdateQuantity,
}: KioskMenuCartPanelProps) {
  const isEmpty = cart.length === 0

  return (
    <aside className="w-[272px] shrink-0 bg-paper border-l border-divider grid grid-rows-[minmax(0,1fr)_auto] min-h-0">
      <div className="overflow-y-auto p-3 min-h-0">
        <div className="flex items-baseline justify-between gap-2 border-b border-dashed border-divider pb-2 mb-2">
          <strong className="text-[14px] font-semibold text-body">
            {totals.itemCount} item{totals.itemCount === 1 ? '' : 's'}
          </strong>
          <span className="font-mono text-[14px] text-brand">{formatCurrency(totals.total)}</span>
        </div>

        {isEmpty ? (
          <KioskCartEmptyState />
        ) : (
          <div className="grid gap-0 mb-3">
            {cart.map((item) => (
              <KioskCartItemRow
                key={item.key}
                item={item}
                onRemove={onRemoveItem}
                onUpdateQuantity={onUpdateQuantity}
              />
            ))}
          </div>
        )}

        <KioskCartNoteField note={note} onChange={onNoteChange} />
        <KioskCartTotalsCard totals={totals} />
      </div>

      <KioskCartFooterActions
        clearDisabled={clearDisabled}
        isEmpty={isEmpty}
        isPlacing={isPlacing}
        onClearCart={onClearCart}
        onPlaceOrder={onPlaceOrder}
      />
    </aside>
  )
}

export default KioskMenuCartPanel
