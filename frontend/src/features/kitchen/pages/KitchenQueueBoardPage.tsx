import KitchenQueueBoardColumn from '../components/KitchenQueueBoardColumn'
import KitchenQueueBoardHeader from '../components/KitchenQueueBoardHeader'
import useKitchenQueueBoardController from './useKitchenQueueBoardController'

function KitchenQueueBoardPage() {
  const { now, preparingOrders, readyOrders } = useKitchenQueueBoardController()

  return (
    <div className="kds-board">
      <KitchenQueueBoardHeader now={now} />

      <div className="kds-board-columns">
        <KitchenQueueBoardColumn
          title="Preparing"
          tone="preparing"
          orders={preparingOrders}
          emptyCopy="No active prep orders"
        />
        <KitchenQueueBoardColumn
          title="Ready for Serving"
          tone="ready"
          orders={readyOrders}
          emptyCopy="No orders ready yet"
        />
      </div>
    </div>
  )
}

export default KitchenQueueBoardPage
