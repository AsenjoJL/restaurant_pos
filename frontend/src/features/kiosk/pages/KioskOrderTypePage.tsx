import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../../shared/components/ui/Button'
import { useKiosk } from '../kiosk.context'
import type { OrderType } from '../../pos/pos.types'

function KioskOrderTypePage() {
  const navigate = useNavigate()
  const { state, setOrderType } = useKiosk()
  const [selected, setSelected] = useState<OrderType | null>(state.orderType)

  const handleSelect = (orderType: OrderType) => {
    setSelected(orderType)
    setOrderType(orderType)
    if (orderType === 'takeout') {
      navigate('/kiosk/menu')
    }
  }

  const handleContinue = () => {
    if (!selected) {
      return
    }
    navigate('/kiosk/menu')
  }

  return (
    <section className="kiosk-page">
      <div className="page-header">
        <div>
          <h2>How would you like your order?</h2>
          <p className="muted">Choose dine-in or takeout to get started.</p>
        </div>
      </div>

      <div className="kiosk-order-grid">
        <button
          type="button"
          className={`kiosk-choice${selected === 'dine-in' ? ' is-selected' : ''}`}
          onClick={() => handleSelect('dine-in')}
        >
          <span className="material-symbols-rounded choice-icon" aria-hidden="true">
            restaurant
          </span>
          <h3>Dine-in</h3>
          <p className="muted">Eat at the restaurant.</p>
        </button>
        <button
          type="button"
          className={`kiosk-choice${selected === 'takeout' ? ' is-selected' : ''}`}
          onClick={() => handleSelect('takeout')}
        >
          <span className="material-symbols-rounded choice-icon" aria-hidden="true">
            takeout_dining
          </span>
          <h3>Takeout</h3>
          <p className="muted">Pick up and go.</p>
        </button>
      </div>

      {selected === 'dine-in' ? (
        <div className="kiosk-actions">
          <Button variant="outline" onClick={() => navigate('/kiosk')} icon="arrow_back">
            Back
          </Button>
          <Button variant="primary" size="lg" onClick={handleContinue} icon="arrow_forward">
            Continue to Menu
          </Button>
        </div>
      ) : null}
    </section>
  )
}

export default KioskOrderTypePage
