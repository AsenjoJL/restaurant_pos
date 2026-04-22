import KitchenBoardCard from '../components/KitchenBoardCard'
import KitchenDisplayHeader from '../components/KitchenDisplayHeader'
import KitchenMetricsPanel from '../components/KitchenMetricsPanel'
import KitchenStationFilterBar from '../components/KitchenStationFilterBar'
import KitchenStationSummary from '../components/KitchenStationSummary'
import useKitchenDisplayPageController from './useKitchenDisplayPageController'

function KitchenDisplayPage() {
  const {
    activeStation,
    adminOverride,
    canOperateKitchen,
    emptyStationCounts,
    filteredOrders,
    filteredTickets,
    handleReadyOrder,
    handleReadyReplacement,
    handleStartOrder,
    handleStartReplacement,
    isAdmin,
    metrics,
    orderStationCountMap,
    overrideRemainingMs,
    replacementStationCountMap,
    setActiveStation,
    stationSummary,
    toggleAdminOverride,
  } = useKitchenDisplayPageController()

  return (
    <div className="page kitchen-page">
      <KitchenDisplayHeader
        adminOverride={adminOverride}
        isAdmin={isAdmin}
        overrideRemainingMs={overrideRemainingMs}
        onOpenCustomerBoard={() => window.open('/KDS', '_blank', 'noopener,noreferrer')}
        onToggleAdminOverride={toggleAdminOverride}
      />

      <div className="kitchen-header-shell">
        <KitchenMetricsPanel metrics={metrics} />
        <KitchenStationSummary stationSummary={stationSummary} />
        <KitchenStationFilterBar
          activeStation={activeStation}
          onSelectStation={setActiveStation}
        />
      </div>

      <div className="kds-grid">
        {filteredOrders.map((order) => {
          return (
            <KitchenBoardCard
              key={order.id}
              kind="order"
              canOperateKitchen={canOperateKitchen}
              onReady={handleReadyOrder}
              onStart={handleStartOrder}
              stationCounts={orderStationCountMap.get(order.id) ?? emptyStationCounts}
              ticket={order}
            />
          )
        })}
        {filteredTickets.map((ticket) => {
          return (
            <KitchenBoardCard
              key={ticket.id}
              kind="replacement"
              canOperateKitchen={canOperateKitchen}
              onReady={handleReadyReplacement}
              onStart={handleStartReplacement}
              stationCounts={replacementStationCountMap.get(ticket.id) ?? emptyStationCounts}
              ticket={ticket}
            />
          )
        })}
        {filteredOrders.length === 0 && filteredTickets.length === 0 ? (
          <div className="panel empty-state">
            <h3>No kitchen tickets yet</h3>
            <p className="muted">
              {activeStation === 'ALL'
                ? 'Paid orders will appear here once sent to the kitchen.'
                : 'No tickets for this station yet.'}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default KitchenDisplayPage
