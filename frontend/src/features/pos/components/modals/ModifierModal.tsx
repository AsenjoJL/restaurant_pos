import { useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../../app/store/hooks'
import Modal from '../../../../shared/components/ui/Modal'
import Button from '../../../../shared/components/ui/Button'
import { formatCurrency } from '../../../../shared/lib/format'
import { closeModifierModal, setItemModifiers } from '../../pos.store'
import { selectDraft, selectPosUi } from '../../pos.selectors'
import type { CartItem, ModifierGroup, SelectedModifier } from '../../pos.types'

type SelectionState = Record<string, string[]>

const buildSelectionState = (item: CartItem): SelectionState =>
  item.selectedModifiers.reduce<SelectionState>((acc, mod) => {
    if (!acc[mod.groupId]) {
      acc[mod.groupId] = []
    }
    acc[mod.groupId].push(mod.optionId)
    return acc
  }, {})

const buildSelectedModifiers = (
  groups: ModifierGroup[],
  selections: SelectionState,
): SelectedModifier[] =>
  groups.flatMap((group) => {
    const selectedIds = selections[group.id] ?? []
    return group.options
      .filter((option) => selectedIds.includes(option.id))
      .map((option) => ({
        groupId: group.id,
        groupName: group.name,
        optionId: option.id,
        name: option.name,
        priceDelta: option.priceDelta,
      }))
  })

const getGroupLimits = (group: ModifierGroup) => {
  const min = group.minSelect ?? (group.required ? 1 : 0)
  const max = group.maxSelect ?? (group.type === 'single' ? 1 : group.options.length)
  return { min, max }
}

function ModifierModalContent({
  item,
  onCancel,
  onSave,
}: {
  item: CartItem
  onCancel: () => void
  onSave: (modifiers: SelectedModifier[], unitPrice: number) => void
}) {
  const groups = useMemo(
    () => item.product.modifierGroups ?? [],
    [item.product.modifierGroups],
  )
  const [selections, setSelections] = useState<SelectionState>(() =>
    buildSelectionState(item),
  )

  const selectedModifiers = useMemo(
    () => buildSelectedModifiers(groups, selections),
    [groups, selections],
  )

  const modifierTotal = selectedModifiers.reduce(
    (sum, mod) => sum + mod.priceDelta,
    0,
  )

  const unitPrice = item.product.price + modifierTotal

  const canSave =
    groups.length > 0 &&
    groups.every((group) => {
      const { min, max } = getGroupLimits(group)
      const count = selections[group.id]?.length ?? 0
      return count >= min && count <= max
    })

  const handleToggle = (group: ModifierGroup, optionId: string) => {
    setSelections((prev) => {
      const current = prev[group.id] ?? []
      const isSelected = current.includes(optionId)
      const { max } = getGroupLimits(group)

      if (group.type === 'single') {
        return { ...prev, [group.id]: [optionId] }
      }

      if (!isSelected && current.length >= max) {
        return prev
      }

      const next = isSelected
        ? current.filter((id) => id !== optionId)
        : [...current, optionId]

      return { ...prev, [group.id]: next }
    })
  }

  if (groups.length === 0) {
    return (
      <div className="empty-state">
        <h4>No modifiers available</h4>
        <p className="muted">This item does not have add-ons.</p>
      </div>
    )
  }

  return (
    <div className="modifier-groups">
      {groups.map((group) => {
        const selectedIds = selections[group.id] ?? []
        const { min, max } = getGroupLimits(group)
        const selectedCount = selectedIds.length
        const isValid = selectedCount >= min && selectedCount <= max

        return (
          <div key={group.id} className="modifier-group">
            <div className="modifier-group-header">
              <div>
                <h4 className="modifier-group-title">{group.name}</h4>
                <p className="modifier-group-meta">
                  {group.type === 'single' ? 'Select 1' : `Select ${min}-${max}`}
                  {group.required ? ' · Required' : ''}
                </p>
              </div>
              <span className="modifier-group-count">
                {selectedCount}/{max}
              </span>
            </div>

            <div className="modifier-options">
              {group.options.map((option) => {
                const isChecked = selectedIds.includes(option.id)
                const maxReached =
                  group.type === 'multi' && !isChecked && selectedCount >= max

                const deltaLabel =
                  option.priceDelta === 0
                    ? 'Included'
                    : option.priceDelta > 0
                      ? `+${formatCurrency(option.priceDelta)}`
                      : `-${formatCurrency(Math.abs(option.priceDelta))}`

                return (
                  <label
                    key={option.id}
                    className={`modifier-option${maxReached ? ' is-disabled' : ''}`}
                  >
                    <span className="modifier-option-left">
                      <input
                        type={group.type === 'single' ? 'radio' : 'checkbox'}
                        name={`group-${group.id}`}
                        checked={isChecked}
                        onChange={() => handleToggle(group, option.id)}
                        disabled={maxReached}
                      />
                      <span>{option.name}</span>
                    </span>
                    <span className="modifier-price">{deltaLabel}</span>
                  </label>
                )
              })}
            </div>

            {!isValid ? (
              <p className="modifier-error">Please complete this group.</p>
            ) : null}
          </div>
        )
      })}

      <div className="modifier-summary">
        <div className="modifier-summary-row">
          <span>Base price</span>
          <span>{formatCurrency(item.product.price)}</span>
        </div>
        <div className="modifier-summary-row">
          <span>Modifiers</span>
          <span>{formatCurrency(modifierTotal)}</span>
        </div>
        <div className="modifier-summary-row modifier-summary-total">
          <span>Unit price</span>
          <span>{formatCurrency(unitPrice)}</span>
        </div>
      </div>

      <div className="modal-actions">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          variant="primary"
          disabled={!canSave}
          onClick={() => onSave(selectedModifiers, unitPrice)}
        >
          Save Modifiers
        </Button>
      </div>
    </div>
  )
}

function ModifierModal() {
  const dispatch = useAppDispatch()
  const ui = useAppSelector(selectPosUi)
  const draft = useAppSelector(selectDraft)

  const item =
    draft.items.find((cartItem) => cartItem.product.id === ui.modifierTargetId) ?? null

  return (
    <Modal
      isOpen={ui.isModifierOpen}
      title="Item Modifiers"
      onClose={() => dispatch(closeModifierModal())}
    >
      {item ? (
        <ModifierModalContent
          key={item.product.id}
          item={item}
          onCancel={() => dispatch(closeModifierModal())}
          onSave={(modifiers, unitPrice) => {
            dispatch(
              setItemModifiers({
                productId: item.product.id,
                selectedModifiers: modifiers,
                finalUnitPrice: unitPrice,
              }),
            )
            dispatch(closeModifierModal())
          }}
        />
      ) : (
        <div className="empty-state">
          <h4>No item selected</h4>
          <p className="muted">Select a cart item to edit modifiers.</p>
        </div>
      )}
    </Modal>
  )
}

export default ModifierModal
