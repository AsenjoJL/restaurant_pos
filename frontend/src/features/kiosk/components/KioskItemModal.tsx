import { useEffect, useState } from 'react'
import type { MenuProduct } from '../../pos/pos.types'
import Button from '../../../shared/components/ui/Button'
import { formatCurrency } from '../../../shared/lib/format'
import { getModifierGroupsForCategory } from '../kiosk.data'
import type { ModifierGroup } from '../kiosk.data'

type KioskItemModalProps = {
  product: MenuProduct | null
  isOpen: boolean
  onClose: () => void
  onAdd: (payload: { product: MenuProduct; quantity: number; modifiers: string[] }) => void
}

const buildModifierList = (groups: ModifierGroup[], selected: Record<string, string[]>) =>
  groups.flatMap((group) =>
    (selected[group.id] ?? []).map((option) => `${group.name}: ${option}`),
  )

function KioskItemModal({ product, isOpen, onClose, onAdd }: KioskItemModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [selected, setSelected] = useState<Record<string, string[]>>({})

  const modifierGroups = product ? getModifierGroupsForCategory(product.categoryId) : []

  useEffect(() => {
    if (product) {
      setQuantity(1)
      setSelected({})
    }
  }, [product?.id])

  if (!isOpen || !product) {
    return null
  }

  const handleToggle = (groupId: string, option: string, selection: 'single' | 'multi') => {
    setSelected((prev) => {
      const current = prev[groupId] ?? []
      if (selection === 'single') {
        return { ...prev, [groupId]: [option] }
      }
      const exists = current.includes(option)
      return {
        ...prev,
        [groupId]: exists ? current.filter((item) => item !== option) : [...current, option],
      }
    })
  }

  const handleAdd = () => {
    onAdd({
      product,
      quantity,
      modifiers: buildModifierList(modifierGroups, selected),
    })
  }

  return (
    <div className="modal-overlay">
      <div className="modal kiosk-modal">
        <div className="modal-header">
          <div>
            <h3>{product.name}</h3>
            <p className="muted">{formatCurrency(product.price)}</p>
          </div>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
        <div className="modal-body">
          <p className="muted">{product.description}</p>
          {modifierGroups.length > 0 ? (
            modifierGroups.map((group) => (
              <div key={group.id} className="kiosk-option-group">
                <h4>{group.name}</h4>
                <div className="kiosk-options">
                  {group.options.map((option) => {
                    const isSelected = (selected[group.id] ?? []).includes(option)
                    return (
                      <button
                        key={option}
                        type="button"
                        className={`kiosk-option${isSelected ? ' is-selected' : ''}`}
                        onClick={() => handleToggle(group.id, option, group.selection)}
                      >
                        <span>{option}</span>
                        <span>{isSelected ? '✓' : ''}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))
          ) : (
            <p className="muted">No customizations available for this item.</p>
          )}
          <div className="kiosk-qty">
            <span className="input-label">Quantity</span>
            <div className="qty-control">
              <button
                type="button"
                className="icon-btn"
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
              >
                -
              </button>
              <span>{quantity}</span>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setQuantity((value) => value + 1)}
              >
                +
              </button>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAdd}>
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  )
}

export default KioskItemModal
