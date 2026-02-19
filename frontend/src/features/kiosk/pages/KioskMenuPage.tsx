import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { categories, products } from '../../../mock/data'
import Button from '../../../shared/components/ui/Button'
import Input from '../../../shared/components/ui/Input'
import { formatCurrency } from '../../../shared/lib/format'
import { useKiosk } from '../kiosk.context'
import KioskItemModal from '../components/KioskItemModal'
import type { MenuProduct } from '../../pos/pos.types'

function KioskMenuPage() {
  const navigate = useNavigate()
  const { state, totals, addItem } = useKiosk()
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id ?? 'all')
  const [selectedProduct, setSelectedProduct] = useState<MenuProduct | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!state.orderType) {
      navigate('/kiosk/order-type', { replace: true })
    }
  }, [navigate, state.orderType])

  const visibleProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()
    return products.filter((product) => {
      const matchesCategory =
        activeCategory === 'all' || product.categoryId === activeCategory
      const matchesSearch =
        normalizedSearch.length === 0 ||
        product.name.toLowerCase().includes(normalizedSearch) ||
        product.description.toLowerCase().includes(normalizedSearch)
      return matchesCategory && matchesSearch
    })
  }, [activeCategory, searchTerm])

  useEffect(() => {
    setIsLoading(true)
    const timer = window.setTimeout(() => setIsLoading(false), 250)
    return () => window.clearTimeout(timer)
  }, [activeCategory, searchTerm])

  const activeCategoryName =
    categories.find((category) => category.id === activeCategory)?.name ?? 'Menu'

  return (
    <section className="kiosk-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2>Choose your items</h2>
          <p className="muted kiosk-order-type">
            <span className="material-symbols-rounded" aria-hidden="true">
              {state.orderType === 'dine-in' ? 'restaurant' : 'shopping_bag'}
            </span>
            {state.orderType === 'dine-in' ? 'Dine In' : 'Takeout'}
          </p>
        </div>
        <div className="kiosk-actions">
          <Button 
            variant="outline" 
            onClick={() => navigate('/kiosk/order-type')} 
            icon="swap_horiz"
            aria-label="Change order type"
          >
            Change Type
          </Button>
          {totals.itemCount > 0 && (
            <Button 
              variant="primary" 
              onClick={() => navigate('/kiosk/cart')} 
              icon="shopping_cart"
              aria-label={`View cart with ${totals.itemCount} items`}
            >
              Cart ({totals.itemCount})
            </Button>
          )}
        </div>
      </div>

      {/* Menu Layout: Categories + Products */}
      <div className="kiosk-menu">
        {/* Category Sidebar */}
        <aside className="panel kiosk-category-panel">
          <div className="kiosk-category-header">
            <span className="material-symbols-rounded" aria-hidden="true">
              restaurant_menu
            </span>
            <h3>Categories</h3>
          </div>
          <div className="kiosk-search">
            <Input
              label="Search"
              placeholder="Search menu items"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
          <div className="kiosk-category-list">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                className={`category-button${activeCategory === category.id ? ' is-active' : ''}`}
                onClick={() => setActiveCategory(category.id)}
              >
                <span>{category.name}</span>
                <span className="category-indicator" />
              </button>
            ))}
          </div>
        </aside>

        {/* Products Grid */}
        <div className="panel kiosk-products">
          <div className="kiosk-products-header">
            <h2>{activeCategoryName}</h2>
            <div className="kiosk-products-count">
              <span className="material-symbols-rounded" aria-hidden="true">
                restaurant
              </span>
              {visibleProducts.length} items
            </div>
          </div>

          {isLoading ? (
            <div className="kiosk-loading-grid">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={`skeleton-${index}`} className="kiosk-product-skeleton" />
              ))}
            </div>
          ) : visibleProducts.length === 0 ? (
            <div className="kiosk-empty-state">
              <span className="material-symbols-rounded" aria-hidden="true">
                restaurant
              </span>
              <h3>No items found</h3>
              <p className="muted">
                {searchTerm.trim()
                  ? 'Try a different search or category.'
                  : 'Try selecting a different category.'}
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setActiveCategory('all')
                  setSearchTerm('')
                }}
                icon="grid_view"
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="product-grid kiosk-product-grid">
              {visibleProducts.map((product) => (
                <button
                  type="button"
                  key={product.id}
                  className={`product-card tone-${product.tone} kiosk-product-card availability-${(
                    product.availability ?? 'AVAILABLE'
                  ).toLowerCase()}`}
                  onClick={() => {
                    if (product.availability === 'SOLD_OUT') {
                      return
                    }
                    setSelectedProduct(product)
                  }}
                  aria-label={`Add ${product.name} to cart, ${formatCurrency(product.price)}`}
                  disabled={product.availability === 'SOLD_OUT'}
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
                    <span className="product-chip">
                      {categories.find((category) => category.id === product.categoryId)?.name ??
                        product.categoryId}
                    </span>
                    {product.availability && product.availability !== 'AVAILABLE' ? (
                      <span
                        className={`availability-badge availability-${product.availability.toLowerCase()}`}
                      >
                        {product.availability === 'LIMITED' ? 'Limited' : 'Sold out'}
                      </span>
                    ) : null}
                  </div>
                  <div className="product-content">
                    <h3>{product.name}</h3>
                    {product.description && (
                      <p className="muted">{product.description}</p>
                    )}
                    <div className="product-footer">
                      <span className="price">{formatCurrency(product.price)}</span>
                      <span className="kiosk-add-pill">
                        <span className="material-symbols-rounded" aria-hidden="true">
                          add
                        </span>
                        Add
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sticky Cart Summary Bar */}
      {totals.itemCount > 0 && (
        <div className="kiosk-cart-summary">
          <div className="kiosk-cart-summary-content">
            <div className="kiosk-cart-summary-icon">
              <span className="material-symbols-rounded" aria-hidden="true">
                shopping_bag
              </span>
            </div>
            <div className="kiosk-cart-summary-text">
              <strong>
                {totals.itemCount} {totals.itemCount === 1 ? 'item' : 'items'}
              </strong>
              <p className="muted">Subtotal {formatCurrency(totals.subtotal)}</p>
            </div>
          </div>
          <Button 
            variant="primary" 
            size="lg" 
            onClick={() => navigate('/kiosk/cart')} 
            icon="arrow_forward"
            aria-label="Review your cart and continue"
          >
            Review Cart
          </Button>
        </div>
      )}

      {/* Empty state message when cart is empty */}
      {totals.itemCount === 0 && (
        <div className="kiosk-empty-cart-toast">
          <span className="material-symbols-rounded" aria-hidden="true">
            shopping_cart
          </span>
          <div>
            <strong>Your cart is empty</strong>
            <span className="muted">
              Tap an item above to get started
            </span>
          </div>
        </div>
      )}

      {/* Product Customization Modal */}
      <KioskItemModal
        product={selectedProduct}
        isOpen={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
        onAdd={({ product, quantity, modifiers }) => {
          addItem({ product, quantity, modifiers })
          setSelectedProduct(null)
        }}
      />
    </section>
  )
}

export default KioskMenuPage
