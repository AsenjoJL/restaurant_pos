import { Outlet, useLocation } from 'react-router-dom'
import { KioskProvider } from '../KioskProvider'
import { useKiosk } from '../useKiosk'
import { formatCurrency } from '../../../shared/lib/format'

const steps = [
  { label: 'Welcome', path: '/kiosk', iconSrc: '/welcome.png' },
  { label: 'Order', path: '/kiosk/menu', iconSrc: '/order.png' },
  { label: 'Pay', path: '/kiosk/print', iconSrc: '/pay.png' },
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
  const { totals } = useKiosk()
  const activeIndex = getStepIndex(location.pathname)
  const showStepper = activeIndex > 0
  const isPrintRoute = location.pathname.startsWith('/kiosk/print')
  const isScrollableFlowRoute =
    isPrintRoute ||
    location.pathname.startsWith('/kiosk/success') ||
    location.pathname.startsWith('/kiosk/slip')
  const isWelcomeRoute = location.pathname === '/kiosk' || location.pathname === '/kiosk/'
  const isMenuRoute = location.pathname.startsWith('/kiosk/menu')

  return (
    <div
      className={`kiosk-shell${isPrintRoute ? ' kiosk-shell-print' : ''}${
        isWelcomeRoute ? ' kiosk-shell-welcome' : ''
      }${isMenuRoute ? ' kiosk-shell-menu' : ''}${
        isScrollableFlowRoute ? ' kiosk-shell-scrollable' : ''
      }`}
    >
      {!isPrintRoute && !isWelcomeRoute ? (
        <header className="kiosk-header kiosk-menu-header">
          <div className="kiosk-menu-header-brand">
            <img className="kiosk-menu-header-brand__mark" src="/Resto.jpg" alt="Asenter Restaurant logo" />
            <h2>Asenter Restaurant</h2>
            <p>Urgello Branch · Customer Kiosk</p>
          </div>
          {showStepper ? (
            <ol className="kiosk-menu-stepper">
              {steps.map((step, index) => {
                const className =
                  index === activeIndex
                    ? 'kiosk-menu-step is-active'
                    : index < activeIndex
                      ? 'kiosk-menu-step is-complete'
                      : 'kiosk-menu-step'
                return (
                  <li key={step.label} className={className}>
                    <img className="kiosk-icon-img" src={step.iconSrc} alt="" aria-hidden="true" />
                    <span>{step.label}</span>
                  </li>
                )
              })}
            </ol>
          ) : (
            <span />
          )}
          <div className="kiosk-menu-header-summary">
            <img className="kiosk-icon-img" src="/items.png" alt="" aria-hidden="true" />
            <span>{totals.itemCount} items · {formatCurrency(totals.total)}</span>
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
