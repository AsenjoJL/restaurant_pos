import type { Order } from '../../types/order'
import ReceiptContent from './ReceiptContent'

type OrderReceiptPreviewProps = {
  order: Order
  variant: 'receipt' | 'invoice'
}

function OrderReceiptPreview({ order, variant }: OrderReceiptPreviewProps) {
  return (
    <section className="receipt-preview receipt-card">
      <ReceiptContent order={order} variant={variant} />
    </section>
  )
}

export default OrderReceiptPreview
