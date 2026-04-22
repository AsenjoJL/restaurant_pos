import Button from '../../../../shared/components/ui/Button'
import { formatCurrency } from '../../../../shared/lib/format'
import type { AdminCategory, AdminProduct } from '../../admin.types'
import { resolveCategoryName } from '../../admin.products-form'
import { useState } from 'react'

const toneMap: Record<string, string> = {
  chicken: '#6d4228',
  seafood: '#43593a',
  pork: '#5d3b27',
  sides: '#3f5468',
  'rice-&-noodles': '#4e642a',
  drinks: '#7a4f20',
  desserts: '#6a467d',
  appetizers: '#6a5730',
}

function ProductThumbnail({ product }: { product: AdminProduct }) {
  const [isBroken, setIsBroken] = useState(false)

  if (!product.imageUrl || isBroken) {
    return (
      <div
        className="relative w-full h-full grid place-items-center"
        aria-hidden="true"
      >
        <svg className="w-14 h-14" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" fill="none" stroke="rgba(26,58,42,0.28)" strokeWidth="1.4" />
          <path d="M8 12h8M12 8v8" stroke="rgba(26,58,42,0.28)" strokeWidth="1.4" />
        </svg>
      </div>
    )
  }

  return (
    <img
      className="relative z-10 w-full h-full object-cover scale-[1.02]"
      src={encodeURI(product.imageUrl)}
      alt={product.name}
      loading="lazy"
      onError={(event) => {
        event.preventDefault()
        setIsBroken(true)
      }}
    />
  )
}

type ProductCatalogTableProps = {
  categories: AdminCategory[]
  products: AdminProduct[]
  onEdit: (product: AdminProduct) => void
  onToggleActive: (product: AdminProduct) => void
}

function ProductCatalogTable({
  categories,
  products,
  onEdit,
  onToggleActive,
}: ProductCatalogTableProps) {
  if (products.length === 0) {
    return (
      <div className="panel admin-card admin-products-catalog">
        <div className="admin-products-empty">
          <h3 className="m-0 text-[18px] font-semibold text-slate-900">No matching products</h3>
          <p className="mt-2 mb-0 text-[13px] text-slate-500">
            Try another search or filter to find a menu item.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="panel admin-card admin-products-catalog">
      <div className="admin-products-catalog-head mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="mb-1 font-mono text-[11px] uppercase tracking-[.18em] text-slate-400">
            Visual catalog
          </p>
          <h3 className="m-0 text-[24px] font-semibold text-slate-900">
            Products as shown to kiosk customers
          </h3>
        </div>
        <span className="admin-products-count rounded-full bg-[#f4efe4] px-3 py-1 font-mono text-[11px] uppercase tracking-[.12em] text-[#6f624d]">
          {products.length} items
        </span>
      </div>

      <div className="admin-products-grid grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => {
          const categoryName = resolveCategoryName(product.categoryId, categories)
          const markupPct =
            product.baseCost > 0 ? ((product.price - product.baseCost) / product.baseCost) * 100 : 0
          const isFeatured = product.isActive && markupPct >= 45
          const cardTone = toneMap[product.categoryId] ?? '#d4c0a7'

          return (
            <article
              key={product.id}
              className={`admin-product-catalog-card overflow-hidden rounded-[18px] border bg-white shadow-[0_8px_28px_rgba(17,24,39,0.06)] transition-shadow ${
                product.isActive
                  ? 'border-[rgba(186,169,130,0.45)] hover:shadow-[0_16px_34px_rgba(17,24,39,0.10)]'
                  : 'border-[rgba(27,31,35,0.08)] opacity-80'
              }`}
            >
              <div
                className={`admin-product-media relative overflow-hidden ${isFeatured ? 'h-[240px]' : 'h-[188px]'}`}
                style={{ backgroundColor: cardTone }}
              >
                <span className="pointer-events-none absolute inset-[14%_28%] rounded-full border border-white/15" />
                <div className="absolute left-3 top-3 z-20 flex flex-wrap gap-2">
                  <span className="rounded-[4px] bg-[#2c2418]/90 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[.1em] text-[#c8bca8]">
                    {product.productClass === 'RAW' ? 'Raw' : 'Menu'}
                  </span>
                  <span
                    className={`rounded-[4px] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[.1em] ${
                      product.isActive
                        ? 'bg-[#1a3a2a]/90 text-[#a8d4ba]'
                        : 'bg-[#5f4c3f]/90 text-[#efe4d0]'
                    }`}
                  >
                    {product.isActive ? 'Active' : 'Hidden'}
                  </span>
                </div>
                <div className="absolute inset-0">
                  <ProductThumbnail product={product} />
                </div>
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[rgba(20,14,10,0.22)] via-[rgba(20,14,10,0.06)] to-transparent" />
              </div>

              <div className="admin-product-body grid gap-3 p-4">
                <div className="grid gap-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className="m-0 text-[18px] font-semibold leading-tight text-slate-900">
                        {product.name}
                      </h4>
                      <p className="mt-1 mb-0 font-mono text-[11px] uppercase tracking-[.1em] text-slate-400">
                        {product.sku}
                      </p>
                    </div>
                    <span className="whitespace-nowrap font-mono text-[16px] text-[#1a3a2a]">
                      {formatCurrency(product.price)}
                    </span>
                  </div>
                  <p className="m-0 min-h-[38px] text-[13px] leading-[1.5] text-slate-500">
                    {product.description || categoryName}
                  </p>
                </div>

                <div className="admin-product-meta grid grid-cols-3 gap-2 rounded-[12px] bg-[#f8f5ef] p-3">
                  <div>
                    <p className="m-0 font-mono text-[10px] uppercase tracking-[.1em] text-slate-400">
                      Category
                    </p>
                    <p className="mt-1 mb-0 text-[13px] font-medium text-slate-800">{categoryName}</p>
                  </div>
                  <div>
                    <p className="m-0 font-mono text-[10px] uppercase tracking-[.1em] text-slate-400">
                      Cost
                    </p>
                    <p className="mt-1 mb-0 text-[13px] font-medium text-slate-800">
                      {formatCurrency(product.baseCost)}
                    </p>
                  </div>
                  <div>
                    <p className="m-0 font-mono text-[10px] uppercase tracking-[.1em] text-slate-400">
                      Markup
                    </p>
                    <p
                      className={`mt-1 mb-0 text-[13px] font-medium ${
                        markupPct < 0 ? 'text-[#9f2f20]' : 'text-slate-800'
                      }`}
                    >
                      {Math.round(markupPct)}%
                    </p>
                  </div>
                </div>

                <div className="admin-product-actions flex gap-2">
                  <Button variant="primary" onClick={() => onEdit(product)}>
                    Edit
                  </Button>
                  <Button
                    variant={product.isActive ? 'danger' : 'secondary'}
                    onClick={() => onToggleActive(product)}
                  >
                    {product.isActive ? 'Hide' : 'Show'}
                  </Button>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}

export default ProductCatalogTable
