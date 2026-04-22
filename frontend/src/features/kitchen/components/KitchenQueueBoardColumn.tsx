import type { Order } from '../../../shared/types/order'
import KitchenQueueBoardCard from './KitchenQueueBoardCard'

type KitchenQueueBoardColumnProps = {
  emptyCopy: string
  orders: Order[]
  title: string
  tone: 'preparing' | 'ready'
}

function KitchenQueueBoardColumn({
  emptyCopy,
  orders,
  title,
  tone,
}: KitchenQueueBoardColumnProps) {
  return (
    <section className={`kds-board-column ${tone}`}>
      <div className="kds-board-column-head">
        <h2>{title}</h2>
        <span>{orders.length}</span>
      </div>
      <div className="kds-board-list">
        {orders.length === 0 ? (
          <div className="kds-board-empty">{emptyCopy}</div>
        ) : (
          orders.map((order) => <KitchenQueueBoardCard key={order.id} kind={tone} order={order} />)
        )}
      </div>
    </section>
  )
}

export default KitchenQueueBoardColumn
