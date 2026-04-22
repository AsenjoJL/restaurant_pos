import Button from '../../../shared/components/ui/Button'
import AdminReplacementsTables from '../components/sales/AdminReplacementsTables'
import ReplacementReviewModal from '../components/sales/ReplacementReviewModal'
import useAdminReplacementsPageController from '../hooks/useAdminReplacementsPageController'

function AdminReplacementsPage() {
  const {
    activeOrderNo,
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
    resolveItemCount,
    resolveOrderLabel,
  } = useAdminReplacementsPageController()

  return (
    <div className="page admin-page admin-replacements-page">
      <div className="page-header">
        <div>
          <h2>Replacement Requests</h2>
          <p className="muted">Approve or reject replacement/remake requests.</p>
        </div>
        <div className="admin-actions">
          <Button variant="outline" onClick={handleBackToSales}>
            Back to Sales
          </Button>
        </div>
      </div>

      <AdminReplacementsTables
        historyRequests={historyRequests}
        pendingRequests={pendingRequests}
        resolveItemCount={resolveItemCount}
        resolveOrderLabel={resolveOrderLabel}
        onReview={handleOpenReview}
      />

      <ReplacementReviewModal
        activeOrderNo={activeOrderNo}
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

export default AdminReplacementsPage
