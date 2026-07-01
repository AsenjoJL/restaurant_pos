import { useCallback, type Dispatch, type SetStateAction } from 'react'
import type { Ingredient, MeasurementUnit } from '../../inventory/inventory.types'
import type { ProductFormState } from '../admin.products-form'

type UseProductFormHandlersOptions = {
  ingredients: Ingredient[]
  setForm: Dispatch<SetStateAction<ProductFormState>>
}

function useProductFormHandlers({
  ingredients,
  setForm,
}: UseProductFormHandlersOptions) {
  const handleIngredientSelect = useCallback(
    (ingredientId: string) => {
      const selectedIngredient = ingredients.find((ingredient) => ingredient.id === ingredientId)
      if (!selectedIngredient) {
        setForm((prev) => ({
          ...prev,
          ingredientId,
          currentStock: '',
          unit: '',
          lowStockAlert: '',
          unitCost: '',
        }))
        return
      }

      setForm((prev) => ({
        ...prev,
        ingredientId,
        currentStock: String(selectedIngredient.onHand),
        unit: selectedIngredient.baseUnit,
        lowStockAlert: String(selectedIngredient.reorderLevel),
        unitCost: String(selectedIngredient.unitCost),
      }))
    },
    [ingredients, setForm],
  )

  const handleAdditionalIngredientSelect = useCallback(
    (index: number, ingredientId: string) => {
      setForm((prev) => {
        const next = [...prev.additionalIngredientIds]
        next[index] = ingredientId
        return { ...prev, additionalIngredientIds: next }
      })
    },
    [setForm],
  )

  const handleAddIngredientLink = useCallback(() => {
    setForm((prev) => ({
      ...prev,
      additionalIngredientIds: [...prev.additionalIngredientIds, ''],
    }))
  }, [setForm])

  const handleRemoveIngredientLink = useCallback(
    (index: number) => {
      setForm((prev) => ({
        ...prev,
        additionalIngredientIds: prev.additionalIngredientIds.filter(
          (_, rowIndex) => rowIndex !== index,
        ),
      }))
    },
    [setForm],
  )

  const handleRecipeIngredientChange = useCallback(
    (index: number, ingredientId: string) => {
      const selectedIngredient = ingredients.find((ingredient) => ingredient.id === ingredientId)
      setForm((prev) => {
        const updated = prev.recipeLines.map((line, rowIndex) => {
          if (rowIndex !== index) {
            return line
          }
          const qtyValue = Number(line.qty)
          const nextQty =
            line.qty.trim().length === 0 || !Number.isFinite(qtyValue) || qtyValue <= 0
              ? '1'
              : line.qty
          return {
            ...line,
            ingredientId,
            qty: ingredientId ? nextQty : line.qty,
            unit: ingredientId
              ? ((selectedIngredient?.baseUnit ?? '') as MeasurementUnit | '')
              : '',
          }
        })
        return { ...prev, recipeLines: updated }
      })
    },
    [ingredients, setForm],
  )

  const handleRecipeQtyChange = useCallback(
    (index: number, qty: string) => {
      setForm((prev) => ({
        ...prev,
        recipeLines: prev.recipeLines.map((line, rowIndex) =>
          rowIndex === index ? { ...line, qty } : line,
        ),
      }))
    },
    [setForm],
  )

  return {
    handleAddIngredientLink,
    handleAdditionalIngredientSelect,
    handleIngredientSelect,
    handleRecipeIngredientChange,
    handleRecipeQtyChange,
    handleRemoveIngredientLink,
  } as const
}

export default useProductFormHandlers
