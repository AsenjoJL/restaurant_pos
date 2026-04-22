import { formatCurrency } from '../../../shared/lib/format'
import type { MenuProduct, OrderType } from '../../pos/pos.types'
import { getCategoryName } from '../../pos/menu.utils'

const toneMap: Record<string, string> = {
  sun: '#c8b18f',
  mint: '#b7c0a6',
  berry: '#bca79b',
  ocean: '#b8b7a8',
  clay: '#c3ad98',
  orchard: '#b7be9d',
}

const cardTagSequence = ['Best Seller', 'Popular', 'New'] as const

const featuredCardIndexes = new Set([0, 5, 10])

type KioskMenuProductGridProps = {
  orderType: OrderType | null
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
  getModifierGroupCount: (categoryId: string) => number
  resolveProductAvailability: (product: MenuProduct) => 'AVAILABLE' | 'LIMITED' | 'SOLD_OUT'
}

function KioskMenuProductGrid({
  orderType,
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
  getModifierGroupCount,
  resolveProductAvailability,
}: KioskMenuProductGridProps) {
  const isAllItemsView = activeCategoryName.trim().toLowerCase() === 'all items'

  return (
    <section className="min-w-0 min-h-0 overflow-hidden bg-cream px-3 py-2 grid grid-rows-[auto_auto_auto_minmax(0,1fr)] gap-2">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 className="m-0 text-[32px] font-semibold text-body">What would you like today?</h2>
          <p className="mt-1 text-[14px] text-muted">
            {orderType === 'dine-in'
              ? 'Dine-in order'
              : orderType === 'takeout'
                ? 'Takeout order'
              : 'Choose an order type from the welcome screen'}
          </p>
        </div>
        <button
          type="button"
          className="border border-divider bg-paper text-body min-h-[38px] px-4 rounded-[3px] font-sans text-[12px] font-semibold uppercase tracking-[.06em] hover:bg-[#EFE9DE]"
          onClick={onBackToHome}
        >
          Back to Home
        </button>
      </header>

      <div className="flex items-center justify-between gap-2 border-b border-divider pb-2">
        <label className="flex items-center gap-2 flex-1 min-w-0">
          <svg className="w-[18px] h-[18px] text-muted" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <line
              x1="16.65"
              y1="16.65"
              x2="21"
              y2="21"
              stroke="currentColor"
              strokeWidth="1.8"
            />
          </svg>
          <input
            type="search"
            placeholder="Search menu items"
            value={searchTerm}
            onChange={(event) => onSearchTermChange(event.target.value)}
            className="w-full min-h-[40px] border-0 border-b border-divider bg-paper font-sans text-[16px] text-body px-2 outline-none"
          />
        </label>
        <div className="inline-flex items-center gap-1.5 font-mono text-[13px] text-muted">
          <img className="w-4 h-4" src="/items.png" alt="" aria-hidden="true" />
          <span>{visibleProducts.length} items</span>
        </div>
      </div>

      <div className="font-mono text-[10px] uppercase tracking-[.15em] text-muted">
        {activeCategoryName}
      </div>

      {visibleProducts.length === 0 ? (
        <div className="border border-dashed border-divider bg-paper rounded-[5px] p-5 grid gap-2 justify-items-start">
          <h3 className="m-0 text-[18px] text-body">No matching menu items</h3>
          <p className="m-0 text-[14px] text-muted">Try another search term or switch category.</p>
          <button
            type="button"
            onClick={onClearFilters}
            className="border border-divider bg-paper text-brand rounded-[2px] min-h-[34px] px-3 text-[12px] uppercase tracking-[.05em]"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div
          className={`min-h-0 overflow-y-auto grid items-start p-3 ${
            isAllItemsView ? 'grid-cols-3 gap-4 pr-3' : 'grid-cols-3 gap-3 pr-4'
          }`}
          style={{ gridAutoRows: 'max-content' }}
        >
          {visibleProducts.map((product, index) => {
            const resolvedAvailability = resolveProductAvailability(product)
            const hasModifiers = getModifierGroupCount(product.categoryId) > 0
            const canAdd = resolvedAvailability === 'AVAILABLE'
            const categoryLabel = getCategoryName(
              categoryNameMap,
              product.categoryId,
              product.categoryId,
            )

            const cardTag = index < 12 ? cardTagSequence[index % cardTagSequence.length] : null
            const isFeatured = !isAllItemsView && featuredCardIndexes.has(index)
            const sizeClass = isFeatured ? 'is-featured' : ''

            return (
              <button
                type="button"
                key={product.id}
                className={`self-start h-fit border border-divider rounded-[8px] bg-paper text-left overflow-hidden transition-all duration-200 ${
                  canAdd ? 'hover:bg-[#FFFDF8] hover:border-[#baa982] hover:shadow-[0_10px_24px_rgba(44,36,24,0.08)]' : 'opacity-60 cursor-default'
                } ${isFeatured ? 'row-span-2' : ''} ${sizeClass}`}
                onClick={() => {
                  if (!canAdd) return
                  if (hasModifiers) {
                    onCustomize(product)
                    return
                  }
                  onAddDirect(product)
                }}
                disabled={!canAdd}
              >
                <div
                  className={`relative shrink-0 overflow-hidden flex items-center justify-center ${
                    isFeatured ? 'h-[330px]' : isAllItemsView ? 'h-[220px]' : 'h-[182px]'
                  }`}
                  style={{ backgroundColor: toneMap[product.tone] ?? '#d4c0a7' }}
                >
                  <span className="absolute inset-[14%_28%] border border-white/18 rounded-full pointer-events-none" />
                  {cardTag ? (
                  <span className="absolute top-3 left-3 z-20 rounded-[3px] bg-body/90 text-[#C8BCA8] text-[8px] uppercase tracking-[.1em] px-2.5 py-1">
                    {cardTag}
                  </span>
                  ) : null}
                  {resolvedAvailability !== 'AVAILABLE' ? (
                    <span className="absolute top-3 left-3 z-20 rounded-[3px] bg-body/90 text-[#C8BCA8] text-[8px] uppercase tracking-[.1em] px-2.5 py-1">
                      Unavailable
                    </span>
                  ) : null}
                  {product.image && !brokenImages[product.id] ? (
                    <img
                      className="relative z-10 w-full h-full object-cover scale-[1.02]"
                      src={encodeURI(product.image)}
                      alt={product.name}
                      loading="lazy"
                      onError={() => onImageError(product.id)}
                    />
                  ) : (
                    <div className="relative z-10 w-full h-full grid place-items-center">
                      <svg className="w-14 h-14" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="9" fill="none" stroke="rgba(26,58,42,0.28)" strokeWidth="1.4" />
                        <path d="M8 12h8M12 8v8" stroke="rgba(26,58,42,0.28)" strokeWidth="1.4" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[rgba(20,14,10,0.16)] via-transparent to-transparent pointer-events-none" />
                </div>
                  <div className={`grid gap-2 ${isFeatured || isAllItemsView ? 'p-4' : 'p-2.5'}`}>
                    <h3
                      className={`m-0 font-semibold text-body leading-tight ${
                      isFeatured ? 'text-[22px]' : isAllItemsView ? 'text-[19px]' : 'text-[16px]'
                      }`}
                    >
                      {product.name}
                    </h3>
                    <p
                      className={`m-0 text-muted leading-[1.4] overflow-hidden ${
                      isFeatured
                        ? 'text-[14px] min-h-[52px]'
                        : isAllItemsView
                          ? 'text-[13px] min-h-[44px]'
                          : 'text-[12px] min-h-[34px]'
                      }`}
                    >
                      {product.description || categoryLabel}
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`font-mono text-brand ${
                        isFeatured ? 'text-[19px]' : isAllItemsView ? 'text-[18px]' : 'text-[15px]'
                      }`}
                    >
                      {formatCurrency(product.price)}
                    </span>
                    <span
                      className={`inline-flex items-center justify-center rounded-[3px] uppercase tracking-[.06em] ${
                        canAdd ? 'bg-brand text-paper' : 'bg-divider text-muted'
                      } ${
                        isFeatured
                          ? 'min-w-[88px] min-h-[34px] text-[12px]'
                          : isAllItemsView
                            ? 'min-w-[98px] min-h-[36px] text-[12px]'
                            : 'min-w-[78px] min-h-[28px] text-[11px]'
                      } ${
                        canAdd ? '' : ''
                      }`}
                    >
                      {canAdd ? '+ Add' : 'Unavailable'}
                    </span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default KioskMenuProductGrid
