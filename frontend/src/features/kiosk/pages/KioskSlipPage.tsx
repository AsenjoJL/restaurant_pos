import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../../shared/components/ui/Button'
import { formatCurrency } from '../../../shared/lib/format'
import { useKiosk } from '../kiosk.context'

function KioskSlipPage() {
  const navigate = useNavigate()
  const { state, totals, reset } = useKiosk()

  useEffect(() => {
    if (!state.orderNumber) {
      navigate('/kiosk', { replace: true })
    }
  }, [navigate, state.orderNumber])

  const handleNewOrder = () => {
    reset()
    navigate('/kiosk')
  }

  const handlePrintSlip = () => {
    if (!state.orderNumber) {
      return
    }
    navigate(`/kiosk/print/${state.orderNumber}`)
  }

  return (
    <section className="kiosk-page kiosk-hero">
      <div className="panel kiosk-hero-card kiosk-slip">
        <span className="status-chip">Order placed</span>
        <h2>Your order number</h2>
        <div className="kiosk-slip-number">{state.orderNumber ?? '---'}</div>
        <p className="muted">
          Please proceed to the counter to pay and present this number.
        </p>
        <div className="kiosk-total-box">
          <div className="summary-row">
            <span>Items</span>
            <span>{totals.itemCount}</span>
          </div>
          <div className="summary-row">
            <span>Total</span>
            <span>{formatCurrency(totals.total)}</span>
          </div>
        </div>
        <div className="kiosk-actions">
          <Button variant="outline" size="lg" onClick={handlePrintSlip} icon="print">
            Print Order Slip
          </Button>
          <Button variant="primary" size="lg" onClick={handleNewOrder} icon="refresh">
            Start New Order
          </Button>
        </div>
      </div>
    </section>
  )
}

export default KioskSlipPage
