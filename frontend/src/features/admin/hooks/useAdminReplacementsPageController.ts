import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../../app/store/hooks'
import { buildAuditUser, logAuditEvent } from '../../../shared/lib/audit'
import { pushToast } from '../../../shared/store/ui.store'
import type { ReplacementRequestStatus } from '../../../shared/types/order'
import { selectAuthUser } from '../../auth/auth.selectors'
import { selectOrders, selectReplacementRequests } from '../../orders/orders.selectors'
import { reviewReplacementRequest } from '../../orders/orders.store'
import {
  buildOrderNoMap,
  buildReplacementReviewPayload,
  EMPTY_ADMIN_REVIEW_STATE,
  getOrderNoFromMap,
  getReplacementItemCount,
  getReplacementReviewStatusText,
  splitReplacementRequests,
  validateReplacementReviewer,
  type AdminReviewState,
} from '../admin.sales-center'

function useAdminReplacementsPageController() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const user = useAppSelector(selectAuthUser)
  const orders = useAppSelector(selectOrders)
  const requests = useAppSelector(selectReplacementRequests)
  const [review, setReview] = useState<AdminReviewState>(EMPTY_ADMIN_REVIEW_STATE)

  const orderNoById = useMemo(() => buildOrderNoMap(orders), [orders])
  const replacementGroups = useMemo(() => splitReplacementRequests(requests), [requests])
  const activeRequest = useMemo(
    () => (review.requestId ? requests.find((item) => item.id === review.requestId) ?? null : null),
    [requests, review.requestId],
  )
  const activeOrderNo = activeRequest ? getOrderNoFromMap(activeRequest.orderId, orderNoById) : null

  const handleCloseReview = () => {
    setReview(EMPTY_ADMIN_REVIEW_STATE)
  }

  const handleOpenReview = (requestId: string) => {
    setReview({ requestId, reviewNote: '', isOpen: true })
  }

  const handleReviewDecision = (status: Exclude<ReplacementRequestStatus, 'PENDING'>) => {
    if (!activeRequest || !user) {
      return
    }

    const reviewerError = validateReplacementReviewer(user)
    if (reviewerError) {
      dispatch(
        pushToast({
          title: 'Admin only',
          description: reviewerError,
          variant: 'error',
        }),
      )
      return
    }

    const statusText = getReplacementReviewStatusText(status)
    dispatch(
      reviewReplacementRequest(
        buildReplacementReviewPayload({
          requestId: activeRequest.id,
          reviewNote: review.reviewNote,
          status,
          user,
        }),
      ),
    )
    logAuditEvent(dispatch, {
      scope: 'REPLACEMENT',
      action: statusText.auditAction,
      message: `Replacement ${statusText.auditVerb} for order ${activeOrderNo ?? activeRequest.orderId}.`,
      user: buildAuditUser(user),
      entityId: activeRequest.orderId,
    })
    dispatch(
      pushToast({
        title: statusText.title,
        description: statusText.description,
        variant: statusText.toastVariant,
      }),
    )
    handleCloseReview()
  }

  return {
    activeOrderNo,
    activeRequest,
    historyRequests: replacementGroups.history,
    pendingRequests: replacementGroups.pending,
    review,
    setReview,
    handleApprove: () => handleReviewDecision('APPROVED'),
    handleBackToSales: () => navigate('/admin/sales-center'),
    handleCloseReview,
    handleOpenReview,
    handleReject: () => handleReviewDecision('REJECTED'),
    resolveItemCount: getReplacementItemCount,
    resolveOrderLabel: (orderId: string) => getOrderNoFromMap(orderId, orderNoById),
  }
}

export default useAdminReplacementsPageController
