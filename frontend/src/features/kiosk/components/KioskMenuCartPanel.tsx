import { formatCurrency } from '../../../shared/lib/format'
import type { MenuProduct } from '../../pos/pos.types'
import type { KioskCartItem, KioskTotals } from '../kiosk.utils'

type KioskMenuCartPanelProps = {
  cart: KioskCartItem[]
  clearDisabled: boolean
  isPlacing: boolean
  note: string
  totals: KioskTotals
  upsellProducts: MenuProduct[]
  onClearCart: () => void
  onQuickAdd: (product: MenuProduct) => void
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
  upsellProducts,
  onClearCart,
  onQuickAdd,
  onNoteChange,
  onPlaceOrder,
  onRemoveItem,
  onUpdateQuantity,
}: KioskMenuCartPanelProps) {
  const isEmpty = cart.length === 0

  return (
    <aside className="grid min-h-0 w-[220px] shrink-0 grid-rows-[auto_minmax(0,1fr)_auto] border-l-2 border-[rgba(228,216,196,0.7)] bg-white shadow-[-10px_0_24px_rgba(28,46,30,0.06),-2px_0_8px_rgba(28,46,30,0.04)]">
      <div className="border-b border-[rgba(239,230,216,0.8)] px-4 py-4 shadow-[inset_0_-1px_0_rgba(255,255,255,0.75)]">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="m-0 text-[16px] font-bold text-[#1c2e1e]">
              {totals.itemCount} item{totals.itemCount === 1 ? '' : 's'}
            </p>
            <p className="mt-1 text-[12px] text-[#857766]">Subtotal</p>
          </div>
          <strong className="font-mono text-[18px] font-medium text-[#1c2e1e]">
            {formatCurrency(totals.subtotal)}
          </strong>
        </div>
      </div>

      <div className="min-h-0 overflow-y-auto bg-white px-4 py-4">
        {isEmpty ? (
          <div className="grid gap-4 text-center">
            <div className="grid justify-items-center gap-3 rounded-[16px] border-2 border-[rgba(239,230,216,0.55)] bg-white px-4 py-6 shadow-[0_16px_28px_rgba(28,46,30,0.08),0_3px_8px_rgba(28,46,30,0.05)]">
              <div className="grid h-14 w-14 place-items-center rounded-full border border-[#e4d8c4] bg-white text-[#8d7f70] shadow-[0_8px_16px_rgba(28,46,30,0.08)]">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="9" cy="20" r="1.5" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="18" cy="20" r="1.5" stroke="currentColor" strokeWidth="1.5" />
                  <path
                    d="M3 4h2l2.4 9.2a1 1 0 0 0 .97.75h8.98a1 1 0 0 0 .97-.76L21 7H7.2"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <p className="m-0 text-[15px] font-bold text-[#1c2e1e]">Your cart is empty</p>
                <p className="mt-2 text-[12px] leading-5 text-[#857766]">
                  Tap a menu item to start your order.
                </p>
              </div>
            </div>

            {upsellProducts.length > 0 ? (
              <div className="grid gap-2 text-left">
                <p className="m-0 text-[11px] font-bold uppercase tracking-[0.12em] text-[#857766]">
                  Add a drink? Add a dessert?
                </p>
                {upsellProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between gap-2 rounded-[12px] border-2 border-[rgba(239,230,216,0.55)] bg-white px-3 py-2 shadow-[0_10px_18px_rgba(28,46,30,0.06),0_2px_6px_rgba(28,46,30,0.04)]"
                  >
                    <div>
                      <p className="m-0 text-[12px] font-bold text-[#1c2e1e]">{product.name}</p>
                      <p className="mt-1 text-[11px] text-[#857766]">{formatCurrency(product.price)}</p>
                    </div>
                    <button
                      type="button"
                      className="min-h-[30px] rounded-[8px] bg-[#1c2e1e] px-3 text-[10px] font-bold uppercase tracking-[0.08em] text-white"
                      onClick={() => onQuickAdd(product)}
                    >
                      + Add
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="grid gap-4">
            <div className="grid gap-2">
              {cart.map((item) => (
                <article key={item.key} className="rounded-[12px] border border-[#efe6d8] px-3 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="m-0 text-[12px] font-bold text-[#1c2e1e]">
                        {item.product.name} x {item.quantity}
                      </p>
                      <p className="mt-1 text-[11px] text-[#857766]">
                        {formatCurrency(item.product.price * item.quantity)}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#8f5d49]"
                      onClick={() => onRemoveItem(item.key)}
                    >
                      Remove
                    </button>
                  </div>
                  <div className="mt-3 inline-flex items-center overflow-hidden rounded-[8px] border border-[#d8ceb8]">
                    <button
                      type="button"
                      className="grid h-[30px] w-[30px] place-items-center bg-[#f5f0e8] text-[16px] text-[#1c2e1e]"
                      onClick={() => onUpdateQuantity(item.key, item.quantity - 1)}
                    >
                      -
                    </button>
                    <span className="min-w-[30px] px-2 text-center text-[11px] font-bold text-[#1c2e1e]">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      className="grid h-[30px] w-[30px] place-items-center bg-[#1c2e1e] text-[14px] text-white"
                      onClick={() => onUpdateQuantity(item.key, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.12em] text-[#857766]">
                Order note
              </label>
              <textarea
                value={note}
                onChange={(event) => onNoteChange(event.target.value)}
                placeholder="Allergy notes or special requests"
                className="min-h-[86px] w-full resize-none rounded-[12px] border border-[#e4d8c4] px-3 py-3 text-[12px] text-[#1c2e1e] outline-none placeholder:text-[#a99886]"
              />
            </div>

            <div className="rounded-[12px] border border-[#efe6d8] px-3 py-3">
              <div className="flex justify-between text-[12px] text-[#857766]">
                <span>Subtotal</span>
                <strong className="font-mono font-medium text-[#1c2e1e]">
                  {formatCurrency(totals.subtotal)}
                </strong>
              </div>
              <div className="mt-2 flex justify-between text-[12px] text-[#857766]">
                <span>Tax (12%)</span>
                <strong className="font-mono font-medium text-[#1c2e1e]">
                  {formatCurrency(totals.tax)}
                </strong>
              </div>
              <div className="my-3 h-px bg-[#1c2e1e]" />
              <div className="flex items-end justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#1c2e1e]">
                  Total
                </span>
                <strong className="font-serif text-[26px] font-normal text-[#1c2e1e]">
                  {formatCurrency(totals.total)}
                </strong>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-2 border-t border-[rgba(239,230,216,0.8)] bg-white px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
        <button
          type="button"
          className="min-h-[40px] w-full rounded-[10px] bg-[#1c2e1e] px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-white disabled:bg-[#c8bba6] disabled:text-[#80735f]"
          onClick={onPlaceOrder}
          disabled={isEmpty || isPlacing}
        >
          Place order
        </button>
        <button
          type="button"
          className="min-h-[38px] w-full rounded-[10px] border border-[#d8ceb8] bg-transparent px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[#1c2e1e] disabled:opacity-40"
          onClick={onClearCart}
          disabled={clearDisabled}
        >
          Clear cart
        </button>
      </div>
    </aside>
  )
}

export default KioskMenuCartPanel
