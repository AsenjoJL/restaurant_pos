import { useEffect, useMemo, useRef, useState } from 'react'
import { getCompatibleUnits } from '../../../inventory/inventory.conversions'
import type { Ingredient, MeasurementUnit } from '../../../inventory/inventory.types'
import type { IngredientSelectOption } from '../../admin.products-page'

export type IngredientSelectionDraft = {
  ingredientId: string
  qty: string
  unit: MeasurementUnit | ''
}

type IngredientSearchSelectProps = {
  value: string
  currentQty: string
  currentUnit: MeasurementUnit | ''
  ingredients: Ingredient[]
  options: IngredientSelectOption[]
  onApply: (drafts: IngredientSelectionDraft[]) => void
}

function IngredientSearchSelect({
  value,
  currentQty,
  currentUnit,
  ingredients,
  options,
  onApply,
}: IngredientSearchSelectProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const ingredientById = useMemo(
    () => new Map(ingredients.map((ingredient) => [ingredient.id, ingredient])),
    [ingredients],
  )
  const selectedOption = useMemo(
    () => options.find((option) => option.value === value) ?? null,
    [options, value],
  )
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [draftSelections, setDraftSelections] = useState<IngredientSelectionDraft[]>([])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    setDraftSelections(
      value
        ? [
            {
              ingredientId: value,
              qty: currentQty.trim() || '1',
              unit: currentUnit || ingredientById.get(value)?.baseUnit || '',
            },
          ]
        : [],
    )

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
        setQuery('')
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
        setQuery('')
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [currentQty, currentUnit, ingredientById, isOpen, value])

  const filteredGroups = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const filteredOptions =
      normalizedQuery.length === 0
        ? options
        : options.filter((option) => {
            const haystack = `${option.label} ${option.category} ${option.unit}`.toLowerCase()
            return haystack.includes(normalizedQuery)
          })

    return Array.from(
      filteredOptions.reduce((groups, option) => {
        const key = option.category || 'Uncategorized'
        const existing = groups.get(key) ?? []
        existing.push(option)
        groups.set(key, existing)
        return groups
      }, new Map<string, IngredientSelectOption[]>()),
    )
  }, [options, query])

  const toggleSelection = (ingredientId: string) => {
    setDraftSelections((current) => {
      const existing = current.find((item) => item.ingredientId === ingredientId)
      if (existing) {
        return current.filter((item) => item.ingredientId !== ingredientId)
      }

      const ingredient = ingredientById.get(ingredientId)
      return [
        ...current,
        {
          ingredientId,
          qty: '1',
          unit: ingredient?.baseUnit ?? '',
        },
      ]
    })
  }

  const updateDraftSelection = (
    ingredientId: string,
    field: 'qty' | 'unit',
    nextValue: string,
  ) => {
    setDraftSelections((current) =>
      current.map((item) =>
        item.ingredientId === ingredientId
          ? {
              ...item,
              [field]: nextValue as IngredientSelectionDraft[typeof field],
            }
          : item,
      ),
    )
  }

  const handleApply = () => {
    onApply(draftSelections)
    setIsOpen(false)
    setQuery('')
  }

  return (
    <div ref={containerRef} className="ingredient-search-select">
      <button
        type="button"
        className="product-editor-control ingredient-search-select__trigger"
        onClick={() => setIsOpen((open) => !open)}
      >
        <span>
          {selectedOption ? `${selectedOption.label} (${selectedOption.unit})` : 'Select ingredient'}
        </span>
        <span className="ingredient-search-select__caret" aria-hidden="true">
          v
        </span>
      </button>

      {isOpen ? (
        <div className="ingredient-search-select__modal">
          <div className="ingredient-search-select__backdrop" />
          <div ref={containerRef} className="ingredient-search-select__panel" role="dialog" aria-modal="true">
            <div className="ingredient-search-select__header">
              <div className="ingredient-search-select__title">Select Ingredient</div>
              <button
                type="button"
                className="ingredient-search-select__close"
                onClick={() => {
                  setIsOpen(false)
                  setQuery('')
                }}
              >
                x
              </button>
            </div>

            <div className="ingredient-search-select__search-shell">
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search ingredients"
                className="product-editor-control ingredient-search-select__search"
                autoFocus
              />
            </div>

            <div className="ingredient-search-select__results">
              {filteredGroups.length === 0 ? (
                <div className="ingredient-search-select__empty">No ingredients found.</div>
              ) : (
                filteredGroups.map(([category, groupOptions]) => (
                  <div key={category} className="ingredient-search-select__group">
                    <div className="ingredient-search-select__group-label">{category}</div>
                    <div className="ingredient-search-select__group-items">
                      {groupOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={`ingredient-search-select__option${
                          draftSelections.some((item) => item.ingredientId === option.value)
                            ? ' is-active'
                            : ''
                        }`}
                        onClick={() => toggleSelection(option.value)}
                      >
                        <span>{option.label}</span>
                        <span className="ingredient-search-select__option-unit">{option.unit}</span>
                      </button>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            {draftSelections.length > 0 ? (
              <div className="ingredient-search-select__selected">
                <div className="ingredient-search-select__selected-title">Selected ingredients</div>
                <div className="ingredient-search-select__selected-head">
                  <span>Ingredient</span>
                  <span>Qty</span>
                  <span>Unit</span>
                </div>
                <div className="ingredient-search-select__selected-list">
                  {draftSelections.map((selection) => {
                    const ingredient = ingredientById.get(selection.ingredientId)
                    const unitOptions = ingredient ? getCompatibleUnits(ingredient) : []

                    return (
                      <div
                        key={selection.ingredientId}
                        className="ingredient-search-select__selected-row"
                      >
                        <button
                          type="button"
                          className="ingredient-search-select__selected-name"
                          onClick={() => toggleSelection(selection.ingredientId)}
                        >
                          {ingredient?.name ?? selection.ingredientId}
                        </button>
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={selection.qty}
                          onChange={(event) =>
                            updateDraftSelection(selection.ingredientId, 'qty', event.target.value)
                          }
                          className="product-editor-control ingredient-search-select__selected-qty"
                        />
                        <select
                          value={selection.unit}
                          onChange={(event) =>
                            updateDraftSelection(selection.ingredientId, 'unit', event.target.value)
                          }
                          className="product-editor-control ingredient-search-select__selected-unit"
                        >
                          <option value="">Select unit</option>
                          {unitOptions.map((unit) => (
                            <option key={unit} value={unit}>
                              {unit}
                            </option>
                          ))}
                        </select>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : null}

            <div className="ingredient-search-select__footer">
              <button
                type="button"
                className="ingredient-search-select__footer-btn ingredient-search-select__footer-btn--ghost"
                onClick={() => setDraftSelections([])}
              >
                Clear
              </button>
              <button
                type="button"
                className="ingredient-search-select__footer-btn ingredient-search-select__footer-btn--primary"
                onClick={handleApply}
                disabled={draftSelections.length === 0}
              >
                Add selected{draftSelections.length > 0 ? ` (${draftSelections.length})` : ''}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default IngredientSearchSelect
