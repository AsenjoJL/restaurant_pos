import { useEffect, useMemo, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppSelector } from '../../../app/store/hooks'
import Button from '../../../shared/components/ui/Button'
import PrintPortal from '../../../shared/components/receipt/PrintPortal'
import { selectOrders } from '../../orders/orders.selectors'
import SlipTemplate from '../components/SlipTemplate'
import { useKiosk } from '../kiosk.context'

const AUTO_RETURN_MS = 7000
const PRINT_DELAY_MS = 250

function KioskPrintSlipPage() {
  const navigate = useNavigate()
  const { orderNo } = useParams<{ orderNo: string }>()
  const { state } = useKiosk()
  const orders = useAppSelector(selectOrders)
  const hasPrintedRef = useRef(false)

  const order = useMemo(() => {
    if (!orderNo) {
      return null
    }
    return (
      state.ordersByNo[orderNo] ??
      orders.find((item) => item.order_no === orderNo || item.id === orderNo) ??
      null
    )
  }, [orderNo, orders, state.ordersByNo])

  useEffect(() => {
    if (!order || hasPrintedRef.current) {
      return
    }
    hasPrintedRef.current = true
    const printTimer = window.setTimeout(() => {
      window.print()
    }, PRINT_DELAY_MS)
    const returnTimer = window.setTimeout(() => {
      navigate(`/kiosk/success/${order.order_no}`, { replace: true })
    }, AUTO_RETURN_MS)
    return () => {
      window.clearTimeout(printTimer)
      window.clearTimeout(returnTimer)
    }
  }, [navigate, order])

  const handleDone = () => {
    if (order) {
      navigate(`/kiosk/success/${order.order_no}`, { replace: true })
      return
    }
    navigate('/kiosk', { replace: true })
  }

  if (!order) {
    return (
      <section className="kiosk-print-page">
        <div className="panel kiosk-print-fallback">
          <h2>Slip not available</h2>
          <p className="muted">
            We could not find that order. Please return to the kiosk or ask staff for help.
          </p>
          <Button variant="primary" onClick={() => navigate('/kiosk', { replace: true })}>
            Back to Kiosk
          </Button>
        </div>
      </section>
    )
  }

  return (
    <section className="kiosk-print-page">
      <div className="kiosk-print-content">
        <SlipTemplate order={order} />
        <div className="kiosk-print-actions">
          <Button variant="outline" onClick={() => window.print()}>
            Print Slip
          </Button>
          <Button variant="primary" onClick={handleDone}>
            Done
          </Button>
          <p className="muted">Returning to your order summary shortly...</p>
        </div>
      </div>

      <PrintPortal>
        <section className="print-sheet slip-print">
          <SlipTemplate order={order} />
        </section>
      </PrintPortal>
    </section>
  )
}

export default KioskPrintSlipPage
