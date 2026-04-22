import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../../app/store/hooks'
import { selectAuthUser } from '../../auth/auth.selectors'
import { selectRuntimeMenuProducts } from '../../pos/menu.selectors'
import { buildDraftFromOrder } from '../../pos/pos.utils'
import { loadDraft, openPaymentModal, startEditingOrder } from '../../pos/pos.store'
import { useScheduledPrint } from '../../../shared/hooks/useScheduledPrint'
import { buildAuditUser, logAuditEvent } from '../../../shared/lib/audit'
import { normalizeReference } from '../../../shared/lib/validators'
import { selectOrders } from '../orders.selectors'
import {
  cancelOrder,
  closeOrder,
  sendToKitchen,
  syncOrderCancellation,
  syncOrderUpdate,
  updateOrderNote,
} from '../orders.store'
import {
  filterCashierOrders,
  getCashierPermissions,
  getCashierTabCounts,
  resolveSelectedOrderId,
  type CashierTab,
} from '../cashier.logic'
import { useCashierAdminOverride } from '../useCashierAdminOverride'

type ConfirmState = {
  isOpen: boolean
  reason: string
  targetId: string | null
}

function useOrdersPageController() {
  const dispatch = useAppDispatch()
  const orders = useAppSelector(selectOrders)
  const runtimeProducts = useAppSelector(selectRuntimeMenuProducts)
  const user = useAppSelector(selectAuthUser)
  const navigate = useNavigate()
  const [tab, setTab] = useState<CashierTab>('unpaid')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [replacementOrderId, setReplacementOrderId] = useState<string | null>(null)
  const [isCashAdjustmentOpen, setIsCashAdjustmentOpen] = useState(false)
  const [isCashDrawerOpen, setIsCashDrawerOpen] = useState(false)
  const [confirm, setConfirm] = useState<ConfirmState>({
    isOpen: false,
    reason: '',
    targetId: null,
  })

  const { printId: printOrderId, schedulePrint: scheduleReceiptPrint } = useScheduledPrint()
  const { pendingCount, readyCount } = useMemo(() => getCashierTabCounts(orders), [orders])

  const filteredOrders = useMemo(
    () => filterCashierOrders(orders, tab, query),
    [orders, query, tab],
  )

  const selectedOrderId = resolveSelectedOrderId(filteredOrders, selectedId)
  const selectedOrder = filteredOrders.find((order) => order.id === selectedOrderId) ?? null
  const printOrder = orders.find((order) => order.id === printOrderId) ?? null
  const replacementOrder = orders.find((order) => order.id === replacementOrderId) ?? null

  const role = user?.role
  const isAdmin = role === 'admin'
  const isCashier = role === 'cashier'
  const { adminOverride, overrideRemainingMs, toggleAdminOverride } =
    useCashierAdminOverride(isAdmin)

  const permissions = getCashierPermissions(selectedOrder, role, { adminOverride })

  const handleTakePayment = () => {
    if (!selectedOrder || !permissions.canTakePayment || !permissions.canOperateCashier) {
      return
    }
    dispatch(openPaymentModal({ orderId: selectedOrder.id }))
  }

  const handleEditOrder = () => {
    if (!selectedOrder || !permissions.canEditOrder) {
      return
    }
    const tableId = selectedOrder.order_type === 'DINE_IN' ? selectedOrder.table ?? null : null
    dispatch(loadDraft(buildDraftFromOrder(selectedOrder, runtimeProducts, tableId)))
    dispatch(startEditingOrder(selectedOrder.id))
    navigate('/pos')
  }

  const withProcessing = (callback: () => void) => {
    setIsProcessing(true)
    callback()
    window.setTimeout(() => setIsProcessing(false), 300)
  }

  const handleSendToKitchen = () => {
    if (!selectedOrder || !permissions.canSendToKitchen || isProcessing) {
      return
    }
    withProcessing(() => {
      dispatch(sendToKitchen({ id: selectedOrder.id }))
      void dispatch(syncOrderUpdate({ id: selectedOrder.id }))
      logAuditEvent(dispatch, {
        scope: 'ORDER',
        action: 'SENT_TO_KITCHEN',
        message: `Order ${selectedOrder.order_no} sent to kitchen.`,
        user: buildAuditUser(user),
        entityId: selectedOrder.id,
      })
    })
  }

  const handleCloseOrder = () => {
    if (!selectedOrder || !permissions.canCloseOrder || isProcessing) {
      return
    }
    withProcessing(() => {
      dispatch(closeOrder({ id: selectedOrder.id }))
      void dispatch(syncOrderUpdate({ id: selectedOrder.id }))
      logAuditEvent(dispatch, {
        scope: 'ORDER',
        action: 'COMPLETED',
        message: `Order ${selectedOrder.order_no} completed.`,
        user: buildAuditUser(user),
        entityId: selectedOrder.id,
      })
    })
  }

  const handleCancel = () => {
    if (!confirm.targetId) {
      return
    }
    const order = orders.find((item) => item.id === confirm.targetId)
    dispatch(cancelOrder({ id: confirm.targetId, reason: confirm.reason }))
    void dispatch(syncOrderCancellation({ id: confirm.targetId, reason: confirm.reason }))
    if (order) {
      logAuditEvent(dispatch, {
        scope: 'ORDER',
        action: 'CANCELLED',
        message: `Order ${order.order_no} cancelled.`,
        user: buildAuditUser(user),
        entityId: order.id,
        metadata: { reason: confirm.reason },
      })
    }
    setConfirm({ isOpen: false, reason: '', targetId: null })
  }

  const handlePrint = () => {
    if (!selectedOrder || !permissions.canPrint) {
      return
    }
    scheduleReceiptPrint(selectedOrder.id)
  }

  const handleQueryChange = (value: string) => {
    setQuery(normalizeReference(value))
  }

  const openCancelConfirm = () => {
    if (!selectedOrder) {
      return
    }
    setConfirm({
      isOpen: true,
      reason: '',
      targetId: selectedOrder.id,
    })
  }

  return {
    adminOverride,
    confirm,
    filteredOrders,
    handleCancel,
    handleCloseOrder,
    handleEditOrder,
    handlePrint,
    handleQueryChange,
    handleSendToKitchen,
    handleTakePayment,
    isAdmin,
    isCashAdjustmentOpen,
    isCashDrawerOpen,
    isCashier,
    isProcessing,
    openCancelConfirm,
    overrideRemainingMs,
    pendingCount,
    permissions,
    printOrder,
    query,
    readyCount,
    replacementOrder,
    replacementOrderId,
    selectedOrder,
    selectedOrderId,
    setConfirm,
    setIsCashAdjustmentOpen,
    setIsCashDrawerOpen,
    setReplacementOrderId,
    setSelectedId,
    setTab,
    tab,
    toggleAdminOverride,
    updateSelectedOrderNote: (note: string) => {
      if (!selectedOrder) {
        return
      }
      dispatch(updateOrderNote({ id: selectedOrder.id, note }))
    },
  }
}

export default useOrdersPageController
