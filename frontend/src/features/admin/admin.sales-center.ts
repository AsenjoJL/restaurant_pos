import type { CashAdjustmentRequest } from '../../shared/types/cash'
import type {
  Order,
  ReplacementRequest,
  ReplacementRequestStatus,
} from '../../shared/types/order'
import type { User } from '../auth/auth.types'

export const SALES_CENTER_LINKS = [
  {
    title: 'Sales History',
    description: 'Daily sales records and performance.',
    to: '/admin/sales',
    icon: '/sales.png',
  },
  {
    title: 'Cash Adjustments',
    description: 'Review cash adjustment requests.',
    to: '/admin/cash-adjustments',
    icon: '/pay.png',
  },
  {
    title: 'Order Deductions',
    description: 'Track inventory and order deductions.',
    to: '/admin/orders-dashboard',
    icon: '/order.png',
  },
  {
    title: 'Replacements',
    description: 'Handle replacement requests.',
    to: '/admin/replacements',
    icon: '/clear.png',
  },
] as const

export const SALES_METHOD_OPTIONS = [
  { value: 'ALL', label: 'All methods' },
  { value: 'CASH', label: 'Cash' },
  { value: 'CARD', label: 'Card' },
  { value: 'GCASH', label: 'GCash' },
  { value: 'OTHER', label: 'Other' },
]

export const SALES_STATUS_OPTIONS = [
  { value: 'ALL', label: 'All status' },
  { value: 'PAID', label: 'Paid' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

export type AdminReviewState = {
  requestId: string | null
  reviewNote: string
  isOpen: boolean
}

export const EMPTY_ADMIN_REVIEW_STATE: AdminReviewState = {
  requestId: null,
  reviewNote: '',
  isOpen: false,
}

export const splitCashAdjustmentRequests = (requests: CashAdjustmentRequest[]) => ({
  pending: requests.filter((item) => item.status === 'PENDING'),
  history: requests.filter((item) => item.status !== 'PENDING'),
})

export const buildOrderNoMap = (orders: Order[]) =>
  new Map(orders.map((order) => [order.id, order.order_no]))

export const getOrderNoFromMap = (orderId: string | undefined, orderNoById: Map<string, string>) => {
  if (!orderId) {
    return '—'
  }

  return orderNoById.get(orderId) ?? orderId
}

export const splitReplacementRequests = (requests: ReplacementRequest[]) => ({
  pending: requests.filter((item) => item.status === 'PENDING'),
  history: requests.filter((item) => item.status !== 'PENDING'),
})

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

export const buildReplacementReviewPayload = ({
  requestId,
  reviewNote,
  status,
  user,
}: {
  requestId: string
  reviewNote: string
  status: Exclude<ReplacementRequestStatus, 'PENDING'>
  user: User
}) => ({
  requestId,
  status,
  reviewNote: toOptionalReviewNote(reviewNote),
  approvedBy: { id: user.id, name: user.name, role: user.role },
})

export const getReplacementReviewStatusText = (
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
