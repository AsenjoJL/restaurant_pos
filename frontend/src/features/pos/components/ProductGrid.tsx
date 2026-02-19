import { useMemo, useState } from 'react'
import { categories, products } from '../../../mock/data'
import { useAppDispatch, useAppSelector } from '../../../app/store/hooks'
import { selectActiveCategory, selectSearchTerm } from '../pos.selectors'
import { addItem } from '../pos.store'
import { formatCurrency } from '../../../shared/lib/format'
import Button from '../../../shared/components/ui/Button'

function ProductGrid() {
  const dispatch = useAppDispatch()
  const activeCategoryId = useAppSelector(selectActiveCategory)
  const searchTerm = useAppSelector(selectSearchTerm)
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({})

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()
    return products.filter((product) => {
      const matchesCategory =
        activeCategoryId === 'all' || product.categoryId === activeCategoryId
      const matchesSearch =
        normalizedSearch.length === 0 ||
        product.name.toLowerCase().includes(normalizedSearch) ||
        product.description.toLowerCase().includes(normalizedSearch)
      return matchesCategory && matchesSearch
    })
  }, [activeCategoryId, searchTerm])

  const activeCategoryName =
    categories.find((category) => category.id === activeCategoryId)?.name ?? 'All Items'

  return (
    <section className="pos-products panel">
      <div className="products-header">
        <div>
          <h2>Menu Items</h2>
          <p className="muted">
            {activeCategoryName} · {filteredProducts.length} items
          </p>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="empty-state panel">
          <h3>No items found</h3>
          <p className="muted">Try a different category or search term.</p>
        </div>
      ) : (
        <div className="product-grid">
          {filteredProducts.map((product) => (
            <article
              key={product.id}
              className={`product-card tone-${product.tone} availability-${(
                product.availability ?? 'AVAILABLE'
              ).toLowerCase()}`}
            >
              <div
                className={`product-media${
                  product.image && !brokenImages[product.id] ? ' has-image' : ''
                }`}
              >
                {product.image && !brokenImages[product.id] ? (
                  <img
                    className="product-image"
                    src={encodeURI(product.image)}
                    alt={product.name}
                    loading="lazy"
                    onError={() =>
                      setBrokenImages((prev) => ({ ...prev, [product.id]: true }))
                    }
                  />
                ) : (
                  <div className="product-image-fallback">
                    <span className="material-symbols-rounded" aria-hidden="true">
                      restaurant
                    </span>
                  </div>
                )}
                <span className="product-chip">{product.categoryId}</span>
                {product.availability && product.availability !== 'AVAILABLE' ? (
                  <span
                    className={`availability-badge availability-${product.availability.toLowerCase()}`}
                  >
                    {product.availability === 'LIMITED' ? 'Limited' : 'Sold out'}
                  </span>
                ) : null}
              </div>
              <div className="product-content">
                <div>
                  <h3>{product.name}</h3>
                  <p className="muted">{product.description}</p>
                </div>
                <div className="product-footer">
                  <span className="price">{formatCurrency(product.price)}</span>
                  <Button
                    variant="ghost"
                    onClick={() => dispatch(addItem(product))}
                    icon="add"
                    disabled={product.availability === 'SOLD_OUT'}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default ProductGrid
