import Modal from '../../../shared/components/ui/Modal'
import CashDrawerActiveSection from './CashDrawerActiveSection'
import CashDrawerOpenSection from './CashDrawerOpenSection'
import useCashDrawerController from '../hooks/useCashDrawerController'

type CashDrawerModalProps = {
  isOpen: boolean
  onClose: () => void
}

function CashDrawerModal({ isOpen, onClose }: CashDrawerModalProps) {
  const {
    activeShift,
    cashTotals,
    closeNotes,
    countedCash,
    entryAmount,
    entryReason,
    entryType,
    openingFloat,
    setCloseNotes,
    setCountedCash,
    setEntryAmount,
    setEntryReason,
    setEntryType,
    setOpeningFloat,
    handleAddEntry,
    handleCloseShift,
    handleOpenShift,
  } = useCashDrawerController()

  return (
    <Modal isOpen={isOpen} title="Cash Drawer" onClose={onClose}>
      {!activeShift ? (
        <CashDrawerOpenSection
          openingFloat={openingFloat}
          onOpenShift={handleOpenShift}
          onOpeningFloatChange={setOpeningFloat}
        />
      ) : (
        <CashDrawerActiveSection
          activeShift={activeShift}
          cashTotals={cashTotals}
          closeNotes={closeNotes}
          countedCash={countedCash}
          entryAmount={entryAmount}
          entryReason={entryReason}
          entryType={entryType}
          onAddEntry={handleAddEntry}
          onCloseNotesChange={setCloseNotes}
          onCloseShift={handleCloseShift}
          onCountedCashChange={setCountedCash}
          onEntryAmountChange={setEntryAmount}
          onEntryReasonChange={setEntryReason}
          onEntryTypeChange={setEntryType}
        />
      )}
    </Modal>
  )
}

export default CashDrawerModal
