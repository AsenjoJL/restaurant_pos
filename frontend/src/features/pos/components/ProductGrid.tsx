import { useMemo, useState } from 'react'
import { categories, products } from '../../../mock/data'
import { useAppDispatch, useAppSelector } from '../../../app/store/hooks'
import { selectActiveCategory, selectSearchTerm } from '../pos.selectors'
import {
  selectInventoryIngredients,
  selectInventoryRecipes,
} from '../../inventory/inventory.selectors'
import { addItem, openBundleModal } from '../pos.store'
import { formatCurrency } from '../../../shared/lib/format'
import Button from '../../../shared/components/ui/Button'
import {
  buildInventoryAvailabilityMap,
  resolveAvailability,
} from '../../inventory/inventory.logic'
import { buildCategoryNameMap, filterMenuProducts, getCategoryName } from '../menu.utils'

function ProductGrid() {
  const dispatch = useAppDispatch()
  const activeCategoryId = useAppSelector(selectActiveCategory)
  const searchTerm = useAppSelector(selectSearchTerm)
  const ingredients = useAppSelector(selectInventoryIngredients)
  const recipes = useAppSelector(selectInventoryRecipes)
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({})

  const categoryNameMap = useMemo(() => buildCategoryNameMap(categories), [])

  const filteredProducts = useMemo(
    () =>
      filterMenuProducts(products, {
        activeCategoryId,
        searchTerm,
      }),
    [activeCategoryId, searchTerm],
  )

  const inventoryAvailability = useMemo(
    () =>
      buildInventoryAvailabilityMap(
        products.map((product) => product.id),
        recipes,
        ingredients,
      ),
    [ingredients, recipes],
  )

  const activeCategoryName = getCategoryName(categoryNameMap, activeCategoryId)

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
          {filteredProducts.map((product) => {
            const resolvedAvailability = resolveAvailability(
              product.availability,
              inventoryAvailability.get(product.id) ?? null,
            )
            const isBundle = product.type === 'BUNDLE'
            const canAdd = resolvedAvailability === 'AVAILABLE'
            return (
              <article
                key={product.id}
                className={`product-card tone-${product.tone} availability-${resolvedAvailability.toLowerCase()}`}
                role={!isBundle ? 'button' : undefined}
                tabIndex={!isBundle ? 0 : undefined}
                onClick={() => {
                  if (isBundle || !canAdd) {
                    return
                  }
                  dispatch(addItem(product))
                }}
                onKeyDown={(event) => {
                  if (isBundle || !canAdd) {
                    return
                  }
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    dispatch(addItem(product))
                  }
                }}
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
                    {getCategoryName(categoryNameMap, product.categoryId, product.categoryId)}
                  </span>
                  {product.type === 'BUNDLE' ? <span className="product-badge">Combo</span> : null}
                  {resolvedAvailability !== 'AVAILABLE' ? (
                    <span
                      className={`availability-badge availability-${resolvedAvailability.toLowerCase()}`}
                    >
                      {resolvedAvailability === 'LIMITED' ? 'Limited' : 'Sold out'}
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
                    {isBundle ? (
                      <Button
                        variant="ghost"
                        onClick={() => dispatch(openBundleModal(product.id))}
                        icon="playlist_add"
                        disabled={!canAdd}
                      >
                        Build Combo
                      </Button>
                    ) : (
                      <span className="muted">Tap card to add</span>
                    )}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default ProductGrid
