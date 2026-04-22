import { useEffect } from 'react'
import CategorySidebar from '../components/CategorySidebar'
import ProductGrid from '../components/ProductGrid'
import CartPanel from '../components/CartPanel'
import ModifierModal from '../components/modals/ModifierModal'
import BundleBuilderModal from '../components/modals/BundleBuilderModal'
import PaymentModal from '../components/modals/PaymentModal'
import ReceiptModal from '../components/modals/ReceiptModal'
import ConfirmDialog from '../../../shared/components/ui/ConfirmDialog'
import { useAppDispatch, useAppSelector } from '../../../app/store/hooks'
import { selectAuthUser } from '../../auth/auth.selectors'
import { selectPosUi } from '../pos.selectors'
import {
  clearItems,
  closeConfirm,
  removeItem,
  setConfirmReason,
  setStaff,
} from '../pos.store'
import {
  confirmTitleMap,
  confirmDescriptionMap,
  confirmLabelMap,
  requiresReason,
} from '../pos.confirmDialog.config'

function PosPage() {
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectAuthUser)
  const ui = useAppSelector(selectPosUi)

  useEffect(() => {
    dispatch(setStaff(user?.id ?? null))
  }, [dispatch, user?.id])

  const requireReason = ui.confirm.intent ? requiresReason(ui.confirm.intent) : false

  const handleConfirm = () => {
    if (!ui.confirm.intent) {
      return
    }

    if (requireReason && ui.confirm.reason.trim().length === 0) {
      return
    }

    if (ui.confirm.intent === 'void-item' && ui.confirm.targetId) {
      dispatch(removeItem(ui.confirm.targetId))
    }

    if (ui.confirm.intent === 'clear-cart') {
      dispatch(clearItems())
    }

    dispatch(closeConfirm())
  }

  return (
    <div className="pos-screen">
      <CategorySidebar />
      <ProductGrid />
      <CartPanel />
      <ModifierModal />
      <BundleBuilderModal />
      <PaymentModal />
      <ReceiptModal />
      <ConfirmDialog
        isOpen={ui.confirm.isOpen}
        title={ui.confirm.intent ? confirmTitleMap[ui.confirm.intent] : 'Confirm'}
        description={
          ui.confirm.intent ? confirmDescriptionMap[ui.confirm.intent] : 'Are you sure?'
        }
        reason={ui.confirm.reason}
        requireReason={requireReason}
        onReasonChange={(value) => dispatch(setConfirmReason(value))}
        onConfirm={handleConfirm}
        onCancel={() => dispatch(closeConfirm())}
        confirmLabel={ui.confirm.intent ? confirmLabelMap[ui.confirm.intent] : 'Confirm'}
      />
    </div>
  )
}

export default PosPage
