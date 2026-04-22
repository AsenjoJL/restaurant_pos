import Modal from '../../../shared/components/ui/Modal'
import type { OrderType } from '../../pos/pos.types'

type KioskOrderTypeModalProps = {
  isOpen: boolean
  onClose: () => void
  onSelect: (orderType: OrderType) => void
}

const orderTypeOptions: Array<{
  orderType: OrderType
  label: string
  description: string
  imageSrc: string
}> = [
  {
    orderType: 'dine-in',
    label: 'Dine-in',
    description: 'Eat at the restaurant.',
    imageSrc: '/dine-in.png',
  },
  {
    orderType: 'takeout',
    label: 'Takeout',
    description: 'Pick up and go.',
    imageSrc: '/take-out.png',
  },
]

function KioskOrderTypeModal({
  isOpen,
  onClose,
  onSelect,
}: KioskOrderTypeModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      title="How would you like your order?"
      onClose={onClose}
      className="kiosk-order-type-modal"
      bodyClassName="kiosk-order-type-modal__body"
      footer={
        <div className="modal-actions">
          <button
            type="button"
            className="kiosk-order-type-modal__return"
            onClick={onClose}
          >
            Return
          </button>
        </div>
      }
    >
      <div className="grid gap-3">
        <p className="m-0 text-[16px] leading-relaxed text-muted">
          Choose dine-in or takeout before we open the menu.
        </p>
        <div className="grid grid-cols-2 gap-3">
          {orderTypeOptions.map((option) => (
            <button
              key={option.orderType}
              type="button"
              className="kiosk-choice"
              onClick={() => onSelect(option.orderType)}
            >
              <span className="choice-icon" aria-hidden="true">
                <img src={option.imageSrc} alt="" className="choice-icon-image" />
              </span>
              <h3 className="text-[24px] leading-tight">{option.label}</h3>
              <p className="text-[16px] leading-relaxed muted">{option.description}</p>
            </button>
          ))}
        </div>
      </div>
    </Modal>
  )
}

export default KioskOrderTypeModal
