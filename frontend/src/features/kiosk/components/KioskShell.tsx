import { Link, Outlet, useLocation } from 'react-router-dom'
import { KioskProvider, useKiosk } from '../kiosk.context'
import { formatCurrency } from '../../../shared/lib/format'

const steps = [
  { label: 'Welcome', path: '/kiosk', icon: 'home' },
  { label: 'Order Type', path: '/kiosk/order-type', icon: 'swap_horiz' },
  { label: 'Menu', path: '/kiosk/menu', icon: 'menu_book' },
  { label: 'Cart', path: '/kiosk/cart', icon: 'shopping_cart' },
  { label: 'Confirm', path: '/kiosk/confirm', icon: 'checklist' },
  { label: 'Success', path: '/kiosk/success', icon: 'check_circle' },
]

const getStepIndex = (pathname: string) => {
  if (pathname === '/kiosk' || pathname === '/kiosk/') {
    return 0
  }

  const matchIndex = steps.findIndex(
    (step) => step.path !== '/kiosk' && pathname.startsWith(step.path),
  )
  return matchIndex === -1 ? 0 : matchIndex
}

function KioskLayout() {
  const location = useLocation()
  const { totals } = useKiosk()
  const activeIndex = getStepIndex(location.pathname)
  const showStepper = activeIndex > 0
  const isPrintRoute = location.pathname.startsWith('/kiosk/print')
  const isWelcomeRoute = location.pathname === '/kiosk' || location.pathname === '/kiosk/'

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
            <Link className="btn btn-outline btn-md" to="/kiosk/cart">
              <span className="material-symbols-rounded btn-icon" aria-hidden="true">
                shopping_cart
              </span>
              View Cart
            </Link>
          </div>
        </header>
      ) : null}
      <main className="kiosk-main">
        <Outlet />
      </main>
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
