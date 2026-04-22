import ConfirmDialog from '../../../shared/components/ui/ConfirmDialog'
import { isPaymentCaptured } from '../../../shared/lib/orders'
import OrderReceiptSheet from '../../../shared/components/receipt/OrderReceiptSheet'
import PaymentModal from '../../pos/components/modals/PaymentModal'
import ReplacementRequestModal from '../components/ReplacementRequestModal'
import CashAdjustmentModal from '../../cash/components/CashAdjustmentModal'
import CashDrawerModal from '../../cash/components/CashDrawerModal'
import CashierQueueFilters from '../components/CashierQueueFilters'
import CashierQueuePanel from '../components/CashierQueuePanel'
import CashierDetailPanel from '../components/CashierDetailPanel'
import CashierToolbar from '../components/CashierToolbar'
import useOrdersPageController from './useOrdersPageController'

function OrdersPage() {
  const {
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
    updateSelectedOrderNote,
  } = useOrdersPageController()

  return (
    <div className="page cashier-page">
      <div className="page-header">
        <div>
          <h2>Cashier Queue</h2>
          <p className="muted">
            Collect payments, send tickets, and close orders.
            {isAdmin && !adminOverride
              ? ' Admin is currently view-only.'
              : ''}
          </p>
        </div>
        <CashierToolbar
          adminOverride={adminOverride}
          canOperateCashier={permissions.canOperateCashier}
          isAdmin={isAdmin}
          isCashier={isCashier}
          onOpenCashAdjustment={() => setIsCashAdjustmentOpen(true)}
          onOpenCashDrawer={() => setIsCashDrawerOpen(true)}
          onQueryChange={handleQueryChange}
          overrideRemainingMs={overrideRemainingMs}
          query={query}
          toggleAdminOverride={toggleAdminOverride}
        />
      </div>

      <div className="cashier-layout">
        <CashierQueueFilters
          pendingCount={pendingCount}
          readyCount={readyCount}
          selectedTab={tab}
          onTabChange={setTab}
        />

        <div className="cashier-grid">
          <CashierQueuePanel
            orders={filteredOrders}
            selectedOrderId={selectedOrderId}
            tab={tab}
            onSelectOrder={setSelectedId}
          />

          <CashierDetailPanel
            order={selectedOrder}
            isCompleted={permissions.isCompleted}
            canOperateCashier={permissions.canOperateCashier}
            canTakePayment={permissions.canTakePayment}
            canSendToKitchen={permissions.canSendToKitchen}
            canCloseOrder={permissions.canCloseOrder}
            canEditOrder={permissions.canEditOrder}
            canPrint={permissions.canPrint}
            canCancelOrder={permissions.canCancelOrder}
            canRequestReplacement={permissions.canRequestReplacement}
            isReplacementLocked={permissions.isReplacementLocked}
            replacementStatus={permissions.replacementStatus}
            isProcessing={isProcessing}
            onOrderNoteChange={updateSelectedOrderNote}
            onTakePayment={handleTakePayment}
            onPrimaryAction={
              permissions.canCloseOrder ? handleCloseOrder : handleSendToKitchen
            }
            onEditOrder={handleEditOrder}
            onPrint={handlePrint}
            onCancelOrder={openCancelConfirm}
            onRequestReplacement={() => {
              if (selectedOrder) {
                setReplacementOrderId(selectedOrder.id)
              }
            }}
          />
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirm.isOpen}
        title="Cancel order"
        description="Provide a reason for cancelling this order."
        reason={confirm.reason}
        requireReason
        onReasonChange={(value) => setConfirm((prev) => ({ ...prev, reason: value }))}
        onConfirm={handleCancel}
        onCancel={() => setConfirm({ isOpen: false, reason: '', targetId: null })}
        confirmLabel="Cancel order"
      />

      {printOrder ? (
        <OrderReceiptSheet
          order={printOrder}
          variant={isPaymentCaptured(printOrder) ? 'receipt' : 'invoice'}
        />
      ) : null}

      <PaymentModal />
      <ReplacementRequestModal
        isOpen={Boolean(replacementOrderId)}
        order={replacementOrder}
        onClose={() => setReplacementOrderId(null)}
      />
      <CashAdjustmentModal
        isOpen={isCashAdjustmentOpen}
        onClose={() => setIsCashAdjustmentOpen(false)}
      />
      <CashDrawerModal
        isOpen={isCashDrawerOpen}
        onClose={() => setIsCashDrawerOpen(false)}
      />
    </div>
  )
}

export default OrdersPage
