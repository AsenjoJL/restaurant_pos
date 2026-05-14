import { formatCurrency } from '../../../shared/lib/format'
import type { MenuProduct } from '../../pos/pos.types'
import { getCategoryName } from '../../pos/menu.utils'
import type { KioskCartItem } from '../kiosk.utils'

const cardTagSequence = ['Best Seller', 'Popular', 'New'] as const

type KioskMenuProductGridProps = {
  cart: KioskCartItem[]
  activeCategoryName: string
  brokenImages: Record<string, boolean>
  categoryNameMap: Map<string, string>
  searchTerm: string
  visibleProducts: MenuProduct[]
  onSearchTermChange: (value: string) => void
  onAddDirect: (product: MenuProduct) => void
  onClearFilters: () => void
  onCustomize: (product: MenuProduct) => void
  onImageError: (productId: string) => void
  onBackToHome: () => void
  onRemoveItem: (key: string) => void
  onUpdateQuantity: (key: string, quantity: number) => void
  getModifierGroupCount: (categoryId: string) => number
  resolveProductAvailability: (product: MenuProduct) => 'AVAILABLE' | 'LIMITED' | 'SOLD_OUT'
}

function KioskMenuProductGrid({
  cart,
  activeCategoryName,
  brokenImages,
  categoryNameMap,
  searchTerm,
  visibleProducts,
  onSearchTermChange,
  onAddDirect,
  onClearFilters,
  onCustomize,
  onImageError,
  onBackToHome,
  onRemoveItem,
  onUpdateQuantity,
  getModifierGroupCount,
  resolveProductAvailability,
}: KioskMenuProductGridProps) {
  const sortedProducts = [...visibleProducts].sort((left, right) => {
    const leftUnavailable = resolveProductAvailability(left) !== 'AVAILABLE'
    const rightUnavailable = resolveProductAvailability(right) !== 'AVAILABLE'

    if (leftUnavailable === rightUnavailable) {
      return 0
    }

    return leftUnavailable ? 1 : -1
  })

  return (
    <section className="min-w-0 min-h-0 overflow-hidden border-l-2 border-r-2 border-[rgba(216,201,176,0.9)] bg-[#FFFFFF] shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_0_0_1px_rgba(228,216,196,0.75),0_18px_34px_rgba(28,46,30,0.09),0_4px_10px_rgba(28,46,30,0.05)]">
      <div className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)]">
        <header className="grid grid-cols-[minmax(0,1fr)_minmax(260px,360px)_auto] items-center gap-4 bg-white px-5 py-4 text-[#1c2e1e]">
          <div>
            <h2 className="m-0 text-[24px] font-bold leading-tight">What would you like today?</h2>
          </div>

          <input
            type="search"
            placeholder="Search Adobo, Sinigang..."
            value={searchTerm}
            onChange={(event) => onSearchTermChange(event.target.value)}
            className="min-h-[42px] w-full rounded-[10px] border border-[rgba(28,46,30,0.18)] bg-white px-4 text-[14px] text-[#1c2e1e] outline-none placeholder:text-[#8b988b]"
          />

          <button
            type="button"
            className="kiosk-back-home-btn min-h-[40px] rounded-[10px] border border-[#2563eb] bg-[#2563eb] px-4 text-[11px] font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#1d4ed8]"
            onClick={onBackToHome}
          >
            Back to Home
          </button>
        </header>

        <div className="grid min-h-0 grid-rows-[auto_auto_minmax(0,1fr)] gap-3 px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#857766]">
              {activeCategoryName}
            </div>
            <div className="text-[12px] text-[#857766]">{sortedProducts.length} items</div>
          </div>

          {sortedProducts.length === 0 ? (
            <div className="rounded-[14px] border border-dashed border-[#d8ceb8] bg-white p-5">
              <h3 className="m-0 text-[18px] font-bold text-[#1c2e1e]">No matching menu items</h3>
              <p className="mt-2 text-[13px] text-[#857766]">
                Try another search term or switch category.
              </p>
              <button
                type="button"
                onClick={onClearFilters}
                className="mt-4 min-h-[34px] rounded-[8px] border border-[#d8ceb8] bg-[#f5f0e8] px-3 text-[11px] font-bold uppercase tracking-[0.08em] text-[#1c2e1e]"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="min-h-0 overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-4">
                {sortedProducts.map((product, index) => {
                  const resolvedAvailability = resolveProductAvailability(product)
                  const hasModifiers = getModifierGroupCount(product.categoryId) > 0
                  const categoryLabel = getCategoryName(
                    categoryNameMap,
                    product.categoryId,
                    product.categoryId,
                  )
                  const cartLines = cart.filter((item) => item.product.id === product.id)
                  const cartQuantity = cartLines.reduce((sum, item) => sum + item.quantity, 0)
                  const simpleCartLine = cartLines.find((item) => item.modifiers.length === 0) ?? null
                  const badge = index < 8 ? cardTagSequence[index % cardTagSequence.length] : null
                  const isUnavailable = resolvedAvailability !== 'AVAILABLE'

                  return (
                    <article
                      key={product.id}
                      className={`grid grid-cols-[140px_minmax(0,1fr)] gap-5 rounded-[14px] border border-transparent bg-white p-4 ${
                        isUnavailable ? 'opacity-45' : ''
                      }`}
                    >
                      <div className="h-[140px] w-[140px] overflow-hidden rounded-[12px] border-none bg-[#ebe0cd]">
                        {product.image && !brokenImages[product.id] ? (
                          <img
                            className="h-full w-full border-none object-cover"
                            src={encodeURI(product.image)}
                            alt={product.name}
                            loading="lazy"
                            onError={() => onImageError(product.id)}
                          />
                        ) : (
                          <div className="grid h-full w-full place-items-center text-[#8fa08f]">
                            <svg className="h-7 w-7" viewBox="0 0 24 24" aria-hidden="true">
                              <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.4" />
                              <path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="1.4" />
                            </svg>
                          </div>
                        )}
                      </div>

                      <div className="grid min-w-0 gap-3">
                        <div className="flex items-center gap-2">
                          <h3 className="m-0 text-[16px] font-bold text-[#1c2e1e]">{product.name}</h3>
                          {isUnavailable ? (
                            <span className="inline-flex rounded-full bg-[#e8ddd0] px-2 py-1 text-[9px] font-bold uppercase tracking-[0.08em] text-[#7e6f61]">
                              Unavailable
                            </span>
                          ) : badge ? (
                            <span className="inline-flex rounded-full bg-[#edf4ee] px-2 py-1 text-[9px] font-bold uppercase tracking-[0.08em] text-[#3a5c3d]">
                              {badge}
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 text-[12px] text-[#857766]">
                          {product.description || categoryLabel}
                        </p>

                        <div className="mt-auto flex items-end justify-between gap-3">
                          <strong className="font-mono text-[16px] font-medium text-[#1c2e1e]">
                            {formatCurrency(product.price)}
                          </strong>

                          {isUnavailable ? (
                            <span className="inline-flex min-h-[34px] min-w-[94px] items-center justify-center rounded-[8px] bg-[#ede4d7] px-3 text-[11px] font-bold uppercase tracking-[0.08em] text-[#8b7f72]">
                              Unavailable
                            </span>
                          ) : cartQuantity > 0 && simpleCartLine ? (
                            <div className="inline-flex min-h-[34px] items-center overflow-hidden rounded-[8px] border border-[#d8ceb8]">
                              <button
                                type="button"
                                className="grid h-[34px] w-[34px] place-items-center bg-[#f5f0e8] text-[18px] text-[#1c2e1e]"
                                onClick={() => {
                                  if (simpleCartLine.quantity === 1) {
                                    onRemoveItem(simpleCartLine.key)
                                    return
                                  }
                                  onUpdateQuantity(simpleCartLine.key, simpleCartLine.quantity - 1)
                                }}
                              >
                                -
                              </button>
                              <span className="min-w-[34px] px-2 text-center text-[12px] font-bold text-[#1c2e1e]">
                                {cartQuantity}
                              </span>
                              <button
                                type="button"
                                className="grid h-[34px] w-[34px] place-items-center bg-[#1c2e1e] text-[16px] text-white"
                                onClick={() => {
                                  if (hasModifiers) {
                                    onCustomize(product)
                                    return
                                  }
                                  onAddDirect(product)
                                }}
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              className="inline-flex min-h-[34px] min-w-[94px] items-center justify-center rounded-[8px] bg-[#1c2e1e] px-3 text-[11px] font-bold uppercase tracking-[0.08em] text-white"
                              onClick={() => {
                                if (hasModifiers) {
                                  onCustomize(product)
                                  return
                                }
                                onAddDirect(product)
                              }}
                            >
                              + Add
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default KioskMenuProductGrid
