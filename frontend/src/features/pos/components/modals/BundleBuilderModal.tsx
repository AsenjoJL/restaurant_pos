import { useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../../app/store/hooks'
import Button from '../../../../shared/components/ui/Button'
import Modal from '../../../../shared/components/ui/Modal'
import { formatCurrency } from '../../../../shared/lib/format'
import { products } from '../../../../mock/data'
import { selectPosUi } from '../../pos.selectors'
import { addBundleItem, closeBundleModal } from '../../pos.store'
import type { BundleGroup, BundleSelection, MenuProduct } from '../../pos.types'

type SelectionMap = Record<string, string[]>
type BundleSelectionMap = Record<string, SelectionMap>

const buildSelectionList = (
  product: MenuProduct,
  selections: SelectionMap,
  catalog: MenuProduct[],
): BundleSelection[] => {
  const groups = product.bundle?.groups ?? []
  return groups.flatMap((group) => {
    const chosen = selections[group.id] ?? []
    return chosen
      .map((productId) => catalog.find((item) => item.id === productId))
      .filter((item): item is MenuProduct => Boolean(item))
      .map((item) => ({
        groupId: group.id,
        groupLabel: group.label,
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
      }))
  })
}

const isGroupValid = (group: BundleGroup, selections: SelectionMap) => {
  const count = selections[group.id]?.length ?? 0
  return count >= group.minSelect && count <= group.maxSelect
}

function BundleBuilderModal() {
  const dispatch = useAppDispatch()
  const ui = useAppSelector(selectPosUi)
  const bundleProduct = useMemo(
    () => products.find((item) => item.id === ui.bundleTargetId) ?? null,
    [ui.bundleTargetId],
  )

  const [selectionMap, setSelectionMap] = useState<BundleSelectionMap>({})
  const selections = bundleProduct ? selectionMap[bundleProduct.id] ?? {} : {}
  const groups = bundleProduct?.bundle?.groups ?? []

  const isValid = bundleProduct
    ? groups.every((group) => isGroupValid(group, selections))
    : false

  const handleClose = () => {
    dispatch(closeBundleModal())
  }

  const handleToggle = (group: BundleGroup, productId: string) => {
    if (!bundleProduct) return
    const current = selections[group.id] ?? []
    const isSingle = group.maxSelect === 1

    let next: string[] = []

    if (isSingle) {
      next = [productId]
    } else {
      if (current.includes(productId)) {
        next = current.filter((id) => id !== productId)
      } else {
        if (current.length >= group.maxSelect) {
          return
        }
        next = [...current, productId]
      }
    }

    setSelectionMap((prev) => ({
      ...prev,
      [bundleProduct.id]: {
        ...prev[bundleProduct.id],
        [group.id]: next,
      },
    }))
  }

  const handleSave = () => {
    if (!bundleProduct) {
      return
    }
    if (!isValid) {
      return
    }
    const list = buildSelectionList(bundleProduct, selections, products)
    dispatch(addBundleItem({ product: bundleProduct, selections: list }))
    handleClose()
  }

  return (
    <Modal
      isOpen={ui.isBundleOpen}
      title={bundleProduct ? `Build ${bundleProduct.name}` : 'Build Combo'}
      onClose={handleClose}
      footer={
        <div className="modal-actions">
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={!bundleProduct || !isValid}>
            Add Combo
          </Button>
        </div>
      }
    >
      {!bundleProduct ? (
        <div className="empty-state">
          <h3>No bundle selected</h3>
          <p className="muted">Choose a combo item to configure.</p>
        </div>
      ) : (
        <div className="bundle-builder">
          <div className="bundle-header">
            <div>
              <h3>{bundleProduct.name}</h3>
              <p className="muted">{bundleProduct.description}</p>
            </div>
            <div className="bundle-price">{formatCurrency(bundleProduct.price)}</div>
          </div>

          {groups.map((group) => {
            const selected = selections[group.id] ?? []
            const isSingle = group.maxSelect === 1
            const allowedProducts = products.filter((item) =>
              group.allowedProductIds.includes(item.id),
            )
            return (
              <div key={group.id} className="bundle-group">
                <div className="bundle-group-header">
                  <div>
                    <h4>{group.label}</h4>
                    <p className="muted">
                      Choose {group.minSelect}
                      {group.maxSelect > 1 ? ` to ${group.maxSelect}` : ''}.
                    </p>
                  </div>
                  {!isGroupValid(group, selections) ? (
                    <span className="bundle-warning">Selection required</span>
                  ) : null}
                </div>

                <div className="bundle-options">
                  {allowedProducts.map((option) => {
                    const checked = selected.includes(option.id)
                    const disableOption =
                      !isSingle && !checked && selected.length >= group.maxSelect
                    return (
                      <label key={option.id} className="bundle-option">
                        <input
                          type={isSingle ? 'radio' : 'checkbox'}
                          name={`bundle-${bundleProduct.id}-${group.id}`}
                          checked={checked}
                          disabled={disableOption}
                          onChange={() => handleToggle(group, option.id)}
                        />
                        <span>{option.name}</span>
                        <span className="muted">{formatCurrency(option.price)}</span>
                      </label>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Modal>
  )
}

export default BundleBuilderModal
