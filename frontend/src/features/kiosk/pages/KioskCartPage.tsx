import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../../shared/components/ui/Button'
import { formatCurrency } from '../../../shared/lib/format'
import { useKiosk } from '../kiosk.context'

function KioskCartPage() {
  const navigate = useNavigate()
  const { state, totals, updateQuantity, removeItem, clearCart } = useKiosk()

  useEffect(() => {
    if (!state.orderType) {
      navigate('/kiosk/order-type', { replace: true })
    }
  }, [navigate, state.orderType])

  const hasItems = state.cart.length > 0

  return (
    <section className="kiosk-page">
      <div className="page-header">
        <div>
          <h2>Your Cart</h2>
          <p className="muted">Review items before confirming.</p>
        </div>
        <div className="kiosk-actions">
          <Button variant="outline" onClick={() => navigate('/kiosk/menu')} icon="arrow_back">
            Back to Menu
          </Button>
          <Button variant="danger" onClick={clearCart} disabled={!hasItems} icon="delete">
            Clear Cart
          </Button>
        </div>
      </div>

      {!hasItems ? (
        <div className="panel cart-empty">
          <h3>Your cart is empty</h3>
          <p className="muted">Add items from the menu to continue.</p>
          <Button variant="primary" onClick={() => navigate('/kiosk/menu')}>
            Browse Menu
          </Button>
        </div>
      ) : (
        <>
          <div className="kiosk-cart-list">
            {state.cart.map((item) => (
              <div key={item.key} className="cart-item">
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
                  <div className="line-total">{formatCurrency(item.product.price * item.quantity)}</div>
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

          <div className="kiosk-total-box">
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

          <div className="kiosk-actions">
            <Button variant="outline" onClick={() => navigate('/kiosk/menu')} icon="add">
              Add More Items
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/kiosk/confirm')}
              icon="arrow_forward"
            >
              Proceed to Confirm
            </Button>
          </div>
        </>
      )}
    </section>
  )
}

export default KioskCartPage
