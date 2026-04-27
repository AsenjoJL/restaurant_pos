import KioskOrderTypeModal from '../components/KioskOrderTypeModal'
import KioskWelcomeSidebar from '../components/KioskWelcomeSidebar'
import useKioskWelcomePageController from './useKioskWelcomePageController'

function KioskWelcomePage() {
  const {
    isOpening,
    isOrderTypeModalOpen,
    handleCloseOrderTypeModal,
    handleOrderTypeSelect,
    handleStart,
  } = useKioskWelcomePageController()

  return (
    <section className="h-screen overflow-hidden bg-white text-body">
      <KioskWelcomeSidebar
        isOpening={isOpening}
        onStart={handleStart}
      />

      <KioskOrderTypeModal
        isOpen={isOrderTypeModalOpen}
        onClose={handleCloseOrderTypeModal}
        onSelect={handleOrderTypeSelect}
      />
    </section>
  )
}

export default KioskWelcomePage
