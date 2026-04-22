import Button from '../../../shared/components/ui/Button'
import AdminCashAdjustmentsTables from '../components/sales/AdminCashAdjustmentsTables'
import CashAdjustmentReviewModal from '../components/sales/CashAdjustmentReviewModal'
import useAdminCashAdjustmentsPageController from '../hooks/useAdminCashAdjustmentsPageController'

function AdminCashAdjustmentsPage() {
  const {
    adjustments,
    activeRequest,
    historyRequests,
    pendingRequests,
    review,
    setReview,
    handleApprove,
    handleBackToSales,
    handleCloseReview,
    handleOpenReview,
    handleReject,
    resolveOrderLabel,
  } = useAdminCashAdjustmentsPageController()

  return (
    <div className="page admin-page admin-cash-adjustments-page">
      <div className="page-header">
        <div>
          <h2>Cash Adjustments</h2>
          <p className="muted">Review wrong change reports and keep a history log.</p>
        </div>
        <div className="admin-actions">
          <Button variant="outline" onClick={handleBackToSales}>
            Back to Sales
          </Button>
        </div>
      </div>

      <AdminCashAdjustmentsTables
        adjustments={adjustments}
        historyRequests={historyRequests}
        pendingRequests={pendingRequests}
        resolveOrderLabel={resolveOrderLabel}
        onReview={handleOpenReview}
      />

      <CashAdjustmentReviewModal
        activeRequest={activeRequest}
        review={review}
        setReview={setReview}
        onApprove={handleApprove}
        onClose={handleCloseReview}
        onReject={handleReject}
      />
    </div>
  )
}

export default AdminCashAdjustmentsPage
