import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppSelector } from '../../../app/store/hooks'
import Button from '../../../shared/components/ui/Button'
import PrintPortal from '../../../shared/components/receipt/PrintPortal'
import { triggerPrint } from '../../../shared/lib/print'
import { selectOrders } from '../../orders/orders.selectors'
import SlipTemplate from '../components/SlipTemplate'
import { useKiosk } from '../useKiosk'

const AUTO_RETURN_MS = 7000
const PRINT_DELAY_MS = 250

function KioskPrintSlipPage() {
  const navigate = useNavigate()
  const { orderNo } = useParams<{ orderNo: string }>()
  const { state } = useKiosk()
  const orders = useAppSelector(selectOrders)
  const hasPrintedRef = useRef(false)
  const [autoPrinted, setAutoPrinted] = useState(false)

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
      void triggerPrint({ silent: true })
      setAutoPrinted(true)
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
      <section className="min-h-screen grid place-items-center bg-cream px-6 py-8">
        <div className="w-full max-w-[500px] bg-paper border border-divider rounded-[8px] p-6 grid gap-4 text-center">
          <h2 className="text-body text-[20px] font-semibold">Slip not available</h2>
          <p className="text-muted text-[12px]">
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
    <section className="min-h-screen grid place-items-center bg-cream px-6 py-8">
      <div className="grid gap-3 justify-items-center max-h-[calc(100vh-64px)] overflow-y-auto pr-1">
        <SlipTemplate order={order} />
        <div className="kiosk-print-actions grid gap-2 justify-items-center text-center">
          {autoPrinted ? (
            <Button
              variant="outline"
              className="kiosk-slip-reprint-btn"
              onClick={() => void triggerPrint({ silent: true })}
            >
              Reprint Slip
            </Button>
          ) : null}
          <Button variant="primary" className="kiosk-slip-done-btn" onClick={handleDone}>
            Done
          </Button>
          <p className="font-mono text-[10px] text-muted tracking-[.06em]">
            Returning to your order summary shortly...
          </p>
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
