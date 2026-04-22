import Badge from '../../../shared/components/ui/Badge'
import { formatEnumLabel } from '../../../shared/lib/orders'
import type { Order, ReplacementStatus } from '../../../shared/types/order'
import { getReplacementLabel } from '../cashier.logic'

type CashierOrderBadgesProps = {
  order: Pick<Order, 'source' | 'status'>
  replacementStatus?: ReplacementStatus | null
}

function CashierOrderBadges({
  order,
  replacementStatus,
}: CashierOrderBadgesProps) {
  const resolvedReplacementStatus = replacementStatus ?? 'NONE'

  return (
    <div className="cashier-detail-badges">
      <Badge variant={order.status}>{formatEnumLabel(order.status)}</Badge>
      {resolvedReplacementStatus !== 'NONE' ? (
        <span className="chip">{getReplacementLabel(resolvedReplacementStatus)}</span>
      ) : null}
      <span className={`chip chip-${order.source.toLowerCase()}`}>
        {formatEnumLabel(order.source)}
      </span>
    </div>
  )
}

export default CashierOrderBadges
