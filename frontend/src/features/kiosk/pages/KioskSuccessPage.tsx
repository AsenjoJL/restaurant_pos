import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppSelector } from '../../../app/store/hooks'
import Button from '../../../shared/components/ui/Button'
import { formatCurrency } from '../../../shared/lib/format'
import { selectOrders } from '../../orders/orders.selectors'
import { useKiosk } from '../kiosk.context'

function KioskSuccessPage() {
  const navigate = useNavigate()
  const { orderNo } = useParams<{ orderNo: string }>()
  const orders = useAppSelector(selectOrders)
  const { reset } = useKiosk()

  const order = useMemo(() => {
    if (!orderNo) {
      return null
    }
    return orders.find((item) => item.order_no === orderNo || item.id === orderNo) ?? null
  }, [orderNo, orders])

  const handleNewOrder = () => {
    reset()
    navigate('/kiosk', { replace: true })
  }

  if (!order) {
    return (
      <section className="kiosk-page kiosk-hero">
        <div className="panel kiosk-success-card">
          <h2>Order not found</h2>
          <p className="muted">
            We could not find that order. Please return to the kiosk and try again.
          </p>
          <div className="kiosk-actions">
            <Button variant="primary" onClick={() => navigate('/kiosk', { replace: true })}>
              Back to Kiosk
            </Button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="kiosk-page kiosk-hero">
      <div className="panel kiosk-success-card">
        <span className="status-chip">Order placed</span>
        <h2>Your order number</h2>
        <div className="kiosk-success-number">{order.order_no}</div>
        <p className="muted">
          Proceed to the counter to pay and present this number.
        </p>

        <div className="kiosk-success-summary">
          <div className="kiosk-success-items">
            {order.items.map((item) => (
              <div key={`${item.id}-${item.name}`} className="kiosk-success-item">
                <div>
                  <strong>{item.name}</strong>
                  <p className="muted">Qty {item.quantity}</p>
                  {item.modifiers?.length ? (
                    <p className="muted">{item.modifiers.join(', ')}</p>
                  ) : null}
                </div>
                <span>{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="kiosk-total-box">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="summary-row">
              <span>Tax</span>
              <span>{formatCurrency(order.tax)}</span>
            </div>
            <div className="summary-total">
              <span>Total</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>

        <div className="kiosk-actions">
          <Button
            variant="outline"
            size="lg"
            icon="print"
            onClick={() => navigate(`/kiosk/print/${order.order_no}`)}
          >
            Print Order Slip
          </Button>
          <Button variant="primary" size="lg" icon="refresh" onClick={handleNewOrder}>
            Start New Order
          </Button>
        </div>
      </div>
    </section>
  )
}

export default KioskSuccessPage
