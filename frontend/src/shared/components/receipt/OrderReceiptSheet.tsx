import type { Order } from '../../types/order'
import PrintPortal from './PrintPortal'
import ReceiptContent from './ReceiptContent'

type OrderReceiptSheetProps = {
  order: Order
  variant: 'receipt' | 'invoice'
}

function OrderReceiptSheet({ order, variant }: OrderReceiptSheetProps) {
  return (
    <PrintPortal>
      <section className="print-sheet" aria-hidden>
        <div className="receipt-preview receipt-print">
          <ReceiptContent order={order} variant={variant} />
        </div>
      </section>
    </PrintPortal>
  )
}

export default OrderReceiptSheet
