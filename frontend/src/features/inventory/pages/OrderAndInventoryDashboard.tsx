import Button from '../../../shared/components/ui/Button'
import OrderHistoryPanel from '../components/dashboard/OrderHistoryPanel'
import useOrderAndInventoryDashboardController from '../dashboard/useOrderAndInventoryDashboardController'

export default function OrderAndInventoryDashboard() {
  const { handleBackToSales, orderHistory } = useOrderAndInventoryDashboardController()

  return (
    <div className="page admin-page admin-order-deductions-page">
      <div className="page-header">
        <div>
          <h2>Order Deductions Dashboard</h2>
          <p className="muted">Review existing orders and ingredient deductions.</p>
        </div>
        <div className="admin-actions">
          <Button variant="outline" onClick={handleBackToSales}>
            Back to Sales
          </Button>
        </div>
      </div>

      <div className="order-deductions-layout">
        <OrderHistoryPanel orders={orderHistory} isEmpty={orderHistory.length === 0} />
      </div>
    </div>
  )
}
