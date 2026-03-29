import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { categories, products } from '../../../mock/data'
import { useAppDispatch, useAppSelector } from '../../../app/store/hooks'
import { selectAdminProducts } from '../../admin/admin.selectors'
import Button from '../../../shared/components/ui/Button'
import Input from '../../../shared/components/ui/Input'
import { formatCurrency } from '../../../shared/lib/format'
import { MAX_NOTE_LENGTH } from '../../../shared/lib/validators'
import { pushToast } from '../../../shared/store/ui.store'
import { useKiosk } from '../kiosk.context'
import KioskItemModal from '../components/KioskItemModal'
import type { MenuProduct } from '../../pos/pos.types'
import { addOrder, syncCreateOrder } from '../../orders/orders.store'
import {
  selectInventoryIngredients,
  selectInventoryRecipes,
} from '../../inventory/inventory.selectors'
import {
  buildInventoryAvailabilityMap,
  resolveAvailability,
} from '../../inventory/inventory.logic'
import { getModifierGroupsForCategory } from '../kiosk.data'
import ConfirmDialog from '../../../shared/components/ui/ConfirmDialog'
import {
  buildCategoryNameMap,
  filterMenuProducts,
  getCategoryName,
  mergeMenuProductsWithAdmin,
} from '../../pos/menu.utils'

function KioskMenuPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const {
    state,
    totals,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    setNote,
    setOrderType,
    placeOrder,
  } = useKiosk()
  const ingredients = useAppSelector(selectInventoryIngredients)
  const recipes = useAppSelector(selectInventoryRecipes)
  const adminProducts = useAppSelector(selectAdminProducts)
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id ?? 'all')
  const [selectedProduct, setSelectedProduct] = useState<MenuProduct | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({})
  const [isPlacing, setIsPlacing] = useState(false)
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false)
  const [clearReason, setClearReason] = useState('')
  const categoryNameMap = useMemo(() => buildCategoryNameMap(categories), [])

  const runtimeProducts = useMemo(
    () => mergeMenuProductsWithAdmin(products, adminProducts),
    [adminProducts],
  )

  const visibleProducts = useMemo(
    () =>
      filterMenuProducts(runtimeProducts, {
        activeCategoryId: activeCategory,
        searchTerm,
      }),
    [activeCategory, runtimeProducts, searchTerm],
  )

  const inventoryAvailability = useMemo(
    () =>
      buildInventoryAvailabilityMap(
        runtimeProducts.map((product) => product.id),
        recipes,
        ingredients,
      ),
    [ingredients, recipes, runtimeProducts],
  )

  const activeCategoryName = getCategoryName(categoryNameMap, activeCategory, 'Menu')

  const requiredErrors = useMemo(() => {
    return state.cart.flatMap((item) => {
      const groups = getModifierGroupsForCategory(item.product.categoryId)
      const requiredGroups = groups.filter((group) => group.selection === 'single')
      if (requiredGroups.length === 0) {
        return []
      }
      const missing = requiredGroups.filter(
        (group) => !item.modifiers.some((modifier) => modifier.startsWith(`${group.name}:`)),
      )
      return missing.length > 0 ? [item.product.name] : []
    })
  }, [state.cart])

  const handlePlaceOrder = () => {
    if (isPlacing) {
      return
    }
    if (!state.orderType) {
      dispatch(
        pushToast({
          title: 'Select order type',
          description: 'Please choose dine-in or takeout before placing the order.',
          variant: 'error',
        }),
      )
      return
    }
    if (state.cart.length === 0) {
      dispatch(
        pushToast({
          title: 'Cart is empty',
          description: 'Add at least one item to place an order.',
          variant: 'error',
        }),
      )
      return
    }
    if (requiredErrors.length > 0) {
      dispatch(
        pushToast({
          title: 'Missing required options',
          description: `Select required options for ${requiredErrors[0]}.`,
          variant: 'error',
        }),
      )
      return
    }
    if (state.note.length > MAX_NOTE_LENGTH) {
      dispatch(
        pushToast({
          title: 'Note too long',
          description: `Order notes must be ${MAX_NOTE_LENGTH} characters or less.`,
          variant: 'error',
        }),
      )
      return
    }

    setIsPlacing(true)
    const result = placeOrder()
    if (!result) {
      setIsPlacing(false)
      dispatch(
        pushToast({
          title: 'Order failed',
          description: 'Please choose an order type and add items.',
          variant: 'error',
        }),
      )
      return
    }

    dispatch(addOrder(result.order))
    void dispatch(syncCreateOrder({ order: result.order }))
    dispatch(
      pushToast({
        title: 'Order placed',
        description: `Order ${result.orderNumber} is ready for payment.`,
        variant: 'success',
      }),
    )
    navigate(`/kiosk/print/${result.orderNumber}`)
  }

  return (
    <section className="kiosk-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2>Choose your items</h2>
          <p className="muted kiosk-order-type">
            <span className="material-symbols-rounded" aria-hidden="true">
              {state.orderType === 'dine-in'
                ? 'restaurant'
                : state.orderType === 'takeout'
                  ? 'shopping_bag'
                  : 'help'}
            </span>
            {state.orderType === 'dine-in'
              ? 'Dine In'
              : state.orderType === 'takeout'
                ? 'Takeout'
                : 'Select order type'}
          </p>
        </div>
        <div className="kiosk-actions">
          <Button variant="outline" onClick={() => navigate('/kiosk')} icon="arrow_back">
            Back to Welcome
          </Button>
        </div>
      </div>

      {/* Menu Layout: Categories + Products */}
      <div className="kiosk-menu kiosk-menu--full">
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

          {visibleProducts.length === 0 ? (
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
              {visibleProducts.map((product) => {
                const resolvedAvailability = resolveAvailability(
                  product.availability,
                  inventoryAvailability.get(product.id) ?? null,
                )
                const hasModifiers =
                  getModifierGroupsForCategory(product.categoryId).length > 0
                const canAdd = resolvedAvailability === 'AVAILABLE'
                const categoryLabel = getCategoryName(
                  categoryNameMap,
                  product.categoryId,
                  product.categoryId,
                )
                const chipLabel = product.description || categoryLabel
                return (
                  <button
                    type="button"
                    key={product.id}
                    className={`product-card tone-${product.tone} kiosk-product-card availability-${(
                      resolvedAvailability
                    ).toLowerCase()}`}
                    onClick={() => {
                      if (!canAdd) {
                        return
                      }
                      if (hasModifiers) {
                        setSelectedProduct(product)
                        return
                      }
                      addItem({ product, quantity: 1, modifiers: [] })
                    }}
                    aria-label={`Add ${product.name} to cart, ${formatCurrency(product.price)}`}
                    disabled={!canAdd}
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
                      {resolvedAvailability !== 'AVAILABLE' ? (
                        <span
                          className={`availability-badge availability-${resolvedAvailability.toLowerCase()}`}
                        >
                          {resolvedAvailability === 'LIMITED' ? 'Low stock' : 'Unavailable'}
                        </span>
                      ) : null}
                      <span className="product-chip">{chipLabel}</span>
                    </div>
                    <div className="product-content">
                      <h3>{product.name}</h3>
                      {product.description && (
                        <p className="muted">{product.description}</p>
                      )}
                      <div className="product-footer">
                        <span className="price">{formatCurrency(product.price)}</span>
                        <span className="kiosk-add-hint">
                          {hasModifiers ? 'Customize' : 'Tap to add'}
                        </span>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Cart Panel */}
        <aside className="panel kiosk-cart-panel">
          <div className="kiosk-cart-header">
            <div>
              <h3>Your Order</h3>
              <p className="muted">
                {state.cart.length === 0
                  ? 'Tap items to start your order.'
                  : `${totals.itemCount} ${totals.itemCount === 1 ? 'item' : 'items'}`}
              </p>
            </div>
            <div className="kiosk-cart-total-chip">
              <span className="muted">Total</span>
              <strong>{formatCurrency(totals.total)}</strong>
            </div>
          </div>

          <div className="kiosk-order-toggle">
            <button
              type="button"
              className={`kiosk-toggle-btn${state.orderType === 'dine-in' ? ' is-active' : ''}`}
              onClick={() => setOrderType('dine-in')}
            >
              Dine-In
            </button>
            <button
              type="button"
              className={`kiosk-toggle-btn${state.orderType === 'takeout' ? ' is-active' : ''}`}
              onClick={() => setOrderType('takeout')}
            >
              Takeout
            </button>
          </div>

          {state.cart.length === 0 ? (
            <div className="kiosk-cart-empty">
              <span className="material-symbols-rounded" aria-hidden="true">
                shopping_cart
              </span>
              <h4>Your cart is empty</h4>
              <p className="muted">Choose items from the menu to continue.</p>
            </div>
          ) : (
            <div className="kiosk-cart-items">
              {state.cart.map((item) => (
                <div key={item.key} className="cart-item kiosk-cart-item">
                  <div className="cart-item-info kiosk-item-meta">
                    <h4>{item.product.name}</h4>
                    <p className="muted">{formatCurrency(item.product.price)} each</p>
                    {item.modifiers.length > 0 ? (
                      <p className="kiosk-modifiers">{item.modifiers.join(', ')}</p>
                    ) : null}
                  </div>
                  <div className="cart-item-actions">
                    <div className="qty-control">
                      <button
                        type="button"
                        className="icon-btn"
                        onClick={() => updateQuantity(item.key, item.quantity - 1)}
                        aria-label="Decrease quantity"
                      >
                        <span className="material-symbols-rounded" aria-hidden="true">
                          remove
                        </span>
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        className="icon-btn"
                        onClick={() => updateQuantity(item.key, item.quantity + 1)}
                        aria-label="Increase quantity"
                      >
                        <span className="material-symbols-rounded" aria-hidden="true">
                          add
                        </span>
                      </button>
                    </div>
                    <div className="line-total">
                      {formatCurrency(item.product.price * item.quantity)}
                    </div>
                    <button
                      type="button"
                      className="link-btn"
                      onClick={() => removeItem(item.key)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <label className="note-field">
            <span className="input-label">Order note (optional)</span>
            <textarea
              className="textarea"
              placeholder="Allergy notes or special requests"
              value={state.note}
              name="kioskOrderNote"
              onChange={(event) => setNote(event.target.value)}
              maxLength={MAX_NOTE_LENGTH}
            />
          </label>

          <div className="kiosk-total-box kiosk-cart-total">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{formatCurrency(totals.subtotal)}</span>
            </div>
            <div className="summary-row">
              <span>Tax</span>
              <span>{formatCurrency(totals.tax)}</span>
            </div>
            <div className="summary-total">
              <span>Total</span>
              <span>{formatCurrency(totals.total)}</span>
            </div>
          </div>

          <div className="kiosk-cart-actions">
            <Button
              variant="outline"
              onClick={() => setIsClearConfirmOpen(true)}
              disabled={state.cart.length === 0}
              icon="delete"
            >
              Clear Cart
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={handlePlaceOrder}
              disabled={state.cart.length === 0 || isPlacing}
              icon="done_all"
            >
              Place Order
            </Button>
          </div>
        </aside>
      </div>

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

      <ConfirmDialog
        isOpen={isClearConfirmOpen}
        title="Clear cart"
        description="Remove all items from the cart?"
        reason={clearReason}
        onReasonChange={setClearReason}
        onConfirm={() => {
          clearCart()
          setIsClearConfirmOpen(false)
          setClearReason('')
        }}
        onCancel={() => {
          setIsClearConfirmOpen(false)
          setClearReason('')
        }}
        confirmLabel="Clear cart"
      />
    </section>
  )
}

export default KioskMenuPage
