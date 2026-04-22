import type { User } from '../auth/auth.types'
import type {
  Order,
  ReplacementRequest,
  ReplacementRequestStatus,
} from '../../shared/types/order'

export type ReviewState = {
  requestId: string | null
  reviewNote: string
  isOpen: boolean
}

export const emptyReviewState: ReviewState = {
  requestId: null,
  reviewNote: '',
  isOpen: false,
}

export const splitReplacementRequests = (requests: ReplacementRequest[]) => ({
  pending: requests.filter((item) => item.status === 'PENDING'),
  history: requests.filter((item) => item.status !== 'PENDING'),
})

export const buildOrderNoMap = (orders: Order[]) =>
  new Map(orders.map((order) => [order.id, order.order_no]))

export const getOrderNoFromMap = (orderId: string, orderNoById: Map<string, string>) =>
  orderNoById.get(orderId) ?? orderId

export const getReplacementItemCount = (request: ReplacementRequest) =>
  request.items.reduce((sum, item) => sum + item.qty, 0)

export const validateReplacementReviewer = (user: User | null): string | null => {
  if (!user || user.role !== 'admin') {
    return 'Only admins can review replacements.'
  }
  return null
}

const toOptionalReviewNote = (reviewNote: string): string | undefined => {
  const trimmed = reviewNote.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

export const buildReviewPayload = ({
  requestId,
  status,
  reviewNote,
  user,
}: {
  requestId: string
  status: Exclude<ReplacementRequestStatus, 'PENDING'>
  reviewNote: string
  user: User
}) => ({
  requestId,
  status,
  reviewNote: toOptionalReviewNote(reviewNote),
  approvedBy: { id: user.id, name: user.name, role: user.role },
})

export const getReviewStatusText = (
  status: Exclude<ReplacementRequestStatus, 'PENDING'>,
) =>
  status === 'APPROVED'
    ? {
        title: 'Replacement approved',
        description: 'Replacement ticket sent to kitchen.',
        auditAction: 'APPROVED' as const,
        auditVerb: 'approved',
        toastVariant: 'success' as const,
      }
    : {
        title: 'Replacement rejected',
        description: 'Replacement request rejected.',
        auditAction: 'REJECTED' as const,
        auditVerb: 'rejected',
        toastVariant: 'warning' as const,
      }
