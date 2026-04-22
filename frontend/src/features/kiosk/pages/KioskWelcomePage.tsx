import KioskOrderTypeModal from '../components/KioskOrderTypeModal'
import KioskWelcomeFooter from '../components/KioskWelcomeFooter'
import KioskWelcomeSidebar from '../components/KioskWelcomeSidebar'
import KioskWelcomeTickerBoard from '../components/KioskWelcomeTickerBoard'
import useKioskWelcomePageController from './useKioskWelcomePageController'

function KioskWelcomePage() {
  const {
    brokenImages,
    clockLabel,
    isOpening,
    isOrderTypeModalOpen,
    orderLookup,
    orderLookupRef,
    rowAnimationMap,
    tracks,
    setOrderLookup,
    handleCloseOrderTypeModal,
    handleImageError,
    handleLookup,
    handleOrderTypeSelect,
    handleStart,
  } = useKioskWelcomePageController()

  return (
    <section className="h-screen overflow-hidden flex bg-brand text-paper">
      <KioskWelcomeSidebar
        isOpening={isOpening}
        clockLabel={clockLabel}
        onStart={handleStart}
      />

      <div className="flex-1 flex flex-col overflow-hidden bg-cream text-body">
        <KioskWelcomeTickerBoard
          brokenImages={brokenImages}
          rowAnimationMap={rowAnimationMap}
          tracks={tracks}
          onImageError={handleImageError}
          onViewMenu={handleStart}
        />
        <KioskWelcomeFooter
          orderLookup={orderLookup}
          orderLookupRef={orderLookupRef}
          onLookupChange={setOrderLookup}
          onLookupSubmit={handleLookup}
        />
      </div>

      <KioskOrderTypeModal
        isOpen={isOrderTypeModalOpen}
        onClose={handleCloseOrderTypeModal}
        onSelect={handleOrderTypeSelect}
      />
    </section>
  )
}

export default KioskWelcomePage
