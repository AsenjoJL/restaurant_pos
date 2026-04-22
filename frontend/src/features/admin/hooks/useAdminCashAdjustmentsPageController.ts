import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../../app/store/hooks'
import { buildAuditUser, logAuditEvent } from '../../../shared/lib/audit'
import { formatCurrency } from '../../../shared/lib/format'
import { pushToast } from '../../../shared/store/ui.store'
import type { CashAdjustmentRequest } from '../../../shared/types/cash'
import { selectAuthUser } from '../../auth/auth.selectors'
import { selectCashAdjustmentRequests, selectCashAdjustments } from '../../cash/cash.selectors'
import { reviewCashAdjustmentRequest } from '../../cash/cash.store'
import { selectOrders } from '../../orders/orders.selectors'
import {
  buildOrderNoMap,
  EMPTY_ADMIN_REVIEW_STATE,
  getOrderNoFromMap,
  splitCashAdjustmentRequests,
  type AdminReviewState,
} from '../admin.sales-center'

function useAdminCashAdjustmentsPageController() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const user = useAppSelector(selectAuthUser)
  const orders = useAppSelector(selectOrders)
  const requests = useAppSelector(selectCashAdjustmentRequests)
  const adjustments = useAppSelector(selectCashAdjustments)
  const [review, setReview] = useState<AdminReviewState>(EMPTY_ADMIN_REVIEW_STATE)

  const orderNoById = useMemo(() => buildOrderNoMap(orders), [orders])
  const { pending: pendingRequests, history: historyRequests } = useMemo(
    () => splitCashAdjustmentRequests(requests),
    [requests],
  )

  const activeRequest: CashAdjustmentRequest | null = useMemo(
    () => (review.requestId ? requests.find((item) => item.id === review.requestId) ?? null : null),
    [requests, review.requestId],
  )

  const handleCloseReview = () => {
    setReview(EMPTY_ADMIN_REVIEW_STATE)
  }

  const handleReview = (requestId: string) => {
    setReview({ requestId, reviewNote: '', isOpen: true })
  }

  const resolveOrderLabel = (orderId?: string) => getOrderNoFromMap(orderId, orderNoById)

  const handleReviewDecision = (status: 'APPROVED' | 'REJECTED') => {
    if (!activeRequest || !user) {
      return
    }

    if (user.role !== 'admin') {
      dispatch(
        pushToast({
          title: 'Admin only',
          description: `Only admins can ${status === 'APPROVED' ? 'approve' : 'reject'} adjustments.`,
          variant: 'error',
        }),
      )
      return
    }

    dispatch(
      reviewCashAdjustmentRequest({
        requestId: activeRequest.id,
        status,
        reviewNote: review.reviewNote.trim() || undefined,
        reviewedBy: { id: user.id, name: user.name, role: user.role },
      }),
    )

    logAuditEvent(dispatch, {
      scope: 'CASH_ADJUSTMENT',
      action: status,
      message: `Cash adjustment ${status === 'APPROVED' ? 'approved' : 'rejected'} (${activeRequest.type}) for ${formatCurrency(activeRequest.amount)}.`,
      user: buildAuditUser(user),
      entityId: activeRequest.relatedOrderId,
    })

    dispatch(
      pushToast({
        title: status === 'APPROVED' ? 'Adjustment approved' : 'Adjustment rejected',
        description:
          status === 'APPROVED' ? 'Cash adjustment recorded.' : 'Request was rejected.',
        variant: status === 'APPROVED' ? 'success' : 'warning',
      }),
    )

    handleCloseReview()
  }

  return {
    adjustments,
    activeRequest,
    historyRequests,
    pendingRequests,
    review,
    setReview,
    handleApprove: () => handleReviewDecision('APPROVED'),
    handleBackToSales: () => navigate('/admin/sales-center'),
    handleCloseReview,
    handleOpenReview: handleReview,
    handleReject: () => handleReviewDecision('REJECTED'),
    resolveOrderLabel,
  }
}

export default useAdminCashAdjustmentsPageController
