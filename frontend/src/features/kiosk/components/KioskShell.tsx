import { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { KioskProvider, useKiosk } from '../kiosk.context'
import { formatCurrency } from '../../../shared/lib/format'
import Modal from '../../../shared/components/ui/Modal'
import Button from '../../../shared/components/ui/Button'

const steps = [
  { label: 'Welcome', path: '/kiosk', icon: 'home' },
  { label: 'Order', path: '/kiosk/menu', icon: 'menu_book' },
  { label: 'Pay', path: '/kiosk/print', icon: 'check_circle' },
]

const getStepIndex = (pathname: string) => {
  if (pathname === '/kiosk' || pathname === '/kiosk/') {
    return 0
  }

  if (
    pathname.startsWith('/kiosk/print') ||
    pathname.startsWith('/kiosk/success')
  ) {
    return 2
  }

  if (pathname.startsWith('/kiosk/menu') || pathname.startsWith('/kiosk/order-type')) {
    return 1
  }

  return 0
}

function KioskLayout() {
  const location = useLocation()
  const { totals, state } = useKiosk()
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const activeIndex = getStepIndex(location.pathname)
  const showStepper = activeIndex > 0
  const isPrintRoute = location.pathname.startsWith('/kiosk/print')
  const isWelcomeRoute = location.pathname === '/kiosk' || location.pathname === '/kiosk/'
  const isMenuRoute = location.pathname.startsWith('/kiosk/menu')

  return (
    <div
      className={`kiosk-shell${isPrintRoute ? ' kiosk-shell-print' : ''}${
        isWelcomeRoute ? ' kiosk-shell-welcome' : ''
      }`}
    >
      {!isPrintRoute ? (
        <header className="kiosk-header panel kiosk-header-card">
          <div className="kiosk-brand">
            <span className="kiosk-brand-mark">QR</span>
            <div>
              <h2>Self-Order Kiosk</h2>
              <p className="muted">Order now, pay at the counter.</p>
            </div>
          </div>
          {showStepper ? (
            <div className="kiosk-stepper">
              {steps.map((step, index) => {
                const className =
                  index === activeIndex
                    ? 'kiosk-step is-active'
                    : index < activeIndex
                      ? 'kiosk-step is-complete'
                      : 'kiosk-step'
                return (
                  <span key={step.label} className={className}>
                    <span className="material-symbols-rounded" aria-hidden="true">
                      {step.icon}
                    </span>
                    {step.label}
                  </span>
                )
              })}
            </div>
          ) : (
            <span />
          )}
          <div className="kiosk-summary">
            <div className="kiosk-summary-meta">
              <span className="material-symbols-rounded" aria-hidden="true">
                shopping_bag
              </span>
              <div>
                <strong>{totals.itemCount} items</strong>
                <span className="muted"> • {formatCurrency(totals.total)}</span>
              </div>
            </div>
            {isMenuRoute ? (
              <button
                type="button"
                className="btn btn-outline btn-md"
                onClick={() => setIsReviewModalOpen(true)}
              >
                <span className="material-symbols-rounded btn-icon" aria-hidden="true">
                  shopping_cart
                </span>
                Review Order
              </button>
            ) : (
              <Link className="btn btn-outline btn-md" to="/kiosk/menu">
                <span className="material-symbols-rounded btn-icon" aria-hidden="true">
                  shopping_cart
                </span>
                Review Order
              </Link>
            )}
          </div>
        </header>
      ) : null}
      <main className="kiosk-main">
        <Outlet />
      </main>
      <Modal
        isOpen={isReviewModalOpen}
        title="Review Order"
        onClose={() => setIsReviewModalOpen(false)}
        footer={
          <div className="kiosk-review-footer">
            <Button variant="outline" onClick={() => setIsReviewModalOpen(false)}>
              Close
            </Button>
          </div>
        }
      >
        <div className="kiosk-review-modal">
          <div className="kiosk-review-head">
            <p className="muted">
              {state.orderType === 'dine-in'
                ? 'Dine-In'
                : state.orderType === 'takeout'
                  ? 'Takeout'
                  : 'Order type not selected'}
            </p>
            <strong>{totals.itemCount} item{totals.itemCount === 1 ? '' : 's'}</strong>
          </div>
          {state.cart.length === 0 ? (
            <div className="kiosk-review-empty">
              <p className="muted">Your cart is empty. Add items from the menu.</p>
            </div>
          ) : (
            <div className="kiosk-review-list">
              {state.cart.map((item) => (
                <div key={item.key} className="kiosk-review-item">
                  <div>
                    <strong>{item.product.name}</strong>
                    <p className="muted">
                      {formatCurrency(item.product.price)} x {item.quantity}
                    </p>
                  </div>
                  <strong>{formatCurrency(item.product.price * item.quantity)}</strong>
                </div>
              ))}
            </div>
          )}
          <div className="kiosk-review-totals">
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
        </div>
      </Modal>
    </div>
  )
}

function KioskShell() {
  return (
    <KioskProvider>
      <KioskLayout />
    </KioskProvider>
  )
}

export default KioskShell
