import { formatCurrency } from '../../../shared/lib/format'
import { formatEnumLabel } from '../../../shared/lib/orders'
import type { Order } from '../../../shared/types/order'
import { KIOSK_TAX_RATE } from '../kiosk.utils'

type SlipTemplateProps = {
  order: Order
  showTotals?: boolean
}

const formatPlacedAtParts = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return { date: value, time: '' }
  }
  const dateLabel = date.toLocaleDateString()
  const timeLabel = date.toLocaleTimeString()
  return { date: dateLabel, time: timeLabel }
}

function SlipTemplate({ order, showTotals = true }: SlipTemplateProps) {
  const taxRateLabel = `${(KIOSK_TAX_RATE * 100).toFixed(2)}%`
  const placedAt = formatPlacedAtParts(order.placed_at)
  const orderTypeLabel = order.order_type === 'DINE_IN' ? 'DINE-IN' : formatEnumLabel(order.order_type)

  return (
    <div className="w-[380px] bg-white border border-[#e8e1d0] rounded-[10px] overflow-hidden text-black">
      <div className="bg-white px-[14px] pt-[12px] pb-[10px] border-b border-dashed border-[#d9cfba]">
        <p className="m-0 mb-2 font-mono text-[9px] uppercase tracking-[.15em] text-black">
          ORDER SLIP
        </p>
        <div className="flex items-center gap-2">
          <img className="w-[30px] h-[30px] rounded-[4px] border border-[#d9cfba] bg-white object-cover" src="/Resto.jpg" alt="Asenter Restaurant logo" />
          <div>
            <h2 className="m-0 font-serif text-[20px] text-black">ASENTER RESTAURANT</h2>
            <p className="m-0 text-[11px] text-black">Urgello Branch</p>
          </div>
        </div>
      </div>

      <div className="flex items-end justify-between gap-2 px-[14px] pt-[12px] pb-[11px] border-b border-dashed border-[#d9cfba]">
        <div className="font-serif text-[36px] leading-none text-black">{order.order_no}</div>
        <span className="inline-flex shrink-0 items-center whitespace-nowrap font-mono text-[10px] uppercase tracking-[.08em] bg-white text-black border border-[#d9cfba] rounded-[6px] px-3 py-1">
          {orderTypeLabel}
        </span>
      </div>

      <div className="flex justify-between gap-3 px-[14px] pt-2 pb-[10px] border-b border-dashed border-[#d9cfba] font-mono text-[11px] text-black">
        <span>{placedAt.date}</span>
        <span>{placedAt.time}</span>
      </div>

      <div className="px-[14px] py-3 grid gap-3 border-b border-dashed border-[#d9cfba] max-h-[248px] overflow-y-auto">
        {order.items.map((item) => (
          <div key={`${order.id}-${item.id}`}>
            <div className="flex justify-between gap-3 text-[12px] font-semibold text-black">
              <span className="font-sans">
                <span className="font-mono text-black mr-1">{item.quantity} x</span>
                {item.name}
              </span>
              <span className="font-mono">{formatCurrency(item.quantity * item.price)}</span>
            </div>
            {item.modifiers?.length ? (
              <div className="ml-4 mt-1 text-[10px] italic text-black">
                Add-ons: {item.modifiers.join(', ')}
              </div>
            ) : null}
            {item.note ? (
              <div className="ml-4 mt-1 text-[10px] italic text-black">Note: {item.note}</div>
            ) : null}
          </div>
        ))}
      </div>

      {showTotals ? (
        <div className="px-[14px] py-3 grid gap-2 text-[11px] font-semibold">
          <div className="flex justify-between text-black">
            <span>Subtotal (est.)</span>
            <span className="font-mono text-black">{formatCurrency(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-black">
            <span>Tax (est.) {taxRateLabel}</span>
            <span className="font-mono text-black">{formatCurrency(order.tax)}</span>
          </div>
          <div className="pt-2 border-t border-black">
            <div className="flex justify-between items-end">
              <span className="font-mono text-[10px] uppercase tracking-[.15em] text-black">
                TOTAL
              </span>
              <span className="font-serif text-[22px] text-black">{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>
      ) : null}

      <div className="bg-white text-black text-center uppercase tracking-[.14em] text-[9px] font-semibold py-[10px] flex items-center justify-center gap-2 border-t border-[#d9cfba]">
        <span className="w-[6px] h-[6px] rounded-full bg-black" aria-hidden="true" />
        Proceed to counter to pay
      </div>
    </div>
  )
}

export default SlipTemplate
