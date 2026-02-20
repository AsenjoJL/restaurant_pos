import type { Order } from '../../shared/types/order'
import type {
  Ingredient,
  Recipe,
  InventoryDeduction,
  InventoryShortage,
  InventoryValidation,
} from './inventory.types.ts'

const formatQtyValue = (value: number) =>
  Number.isInteger(value) ? String(value) : value.toFixed(2)

export const formatIngredientQty = (value: number, unit: Ingredient['unit']) =>
  `${formatQtyValue(value)} ${unit}`

export const buildInventoryDeductions = (
  order: Order,
  recipes: Recipe[],
): InventoryDeduction[] => {
  const recipeMap = new Map(recipes.map((recipe) => [recipe.productId, recipe]))
  const requiredMap = new Map<string, number>()

  order.items.forEach((item) => {
    if (item.bundle_items && item.bundle_items.length > 0) {
      item.bundle_items.forEach((bundleItem) => {
        const recipe = recipeMap.get(bundleItem.id)
        if (!recipe) {
          return
        }
        recipe.lines.forEach((line) => {
          const requiredQty = line.qty * bundleItem.quantity * item.quantity
          const current = requiredMap.get(line.ingredientId) ?? 0
          requiredMap.set(line.ingredientId, current + requiredQty)
        })
      })
      return
    }

    const recipe = recipeMap.get(item.id)
    if (!recipe) {
      return
    }
    recipe.lines.forEach((line) => {
      const requiredQty = line.qty * item.quantity
      const current = requiredMap.get(line.ingredientId) ?? 0
      requiredMap.set(line.ingredientId, current + requiredQty)
    })
  })

  return Array.from(requiredMap.entries()).map(([ingredientId, qty]) => ({
    ingredientId,
    qty,
  }))
}

export const buildInventoryDeductionsForRefund = (
  order: Order,
  refundItems: { id: string; qty: number }[],
  recipes: Recipe[],
): InventoryDeduction[] => {
  if (refundItems.length === 0) {
    return []
  }
  const refundMap = new Map(refundItems.map((item) => [item.id, item.qty]))
  const items = order.items
    .filter((item) => refundMap.has(item.id))
    .map((item) => ({
      ...item,
      quantity: refundMap.get(item.id) ?? 0,
    }))

  return buildInventoryDeductions({ ...order, items }, recipes)
}

export const validateInventoryForOrder = (
  order: Order,
  recipes: Recipe[],
  ingredients: Ingredient[],
): InventoryValidation => {
  const deductions = buildInventoryDeductions(order, recipes)
  if (deductions.length === 0) {
    return { ok: true, deductions, shortages: [] }
  }

  const ingredientMap = new Map(ingredients.map((item) => [item.id, item]))
  const shortages: InventoryShortage[] = []

  deductions.forEach((deduction) => {
    const ingredient = ingredientMap.get(deduction.ingredientId)
    const available = ingredient?.onHand ?? 0
    if (available < deduction.qty) {
      shortages.push({
        ingredientId: deduction.ingredientId,
        name: ingredient?.name ?? 'Unknown ingredient',
        unit: ingredient?.unit ?? 'pcs',
        required: deduction.qty,
        available,
        deficit: deduction.qty - available,
      })
    }
  })

  return { ok: shortages.length === 0, deductions, shortages }
}

export const buildInventoryShortageMessage = (shortages: InventoryShortage[]) => {
  if (shortages.length === 0) {
    return ''
  }
  return shortages
    .map(
      (shortage) =>
        `${shortage.name}: need ${formatIngredientQty(
          shortage.required,
          shortage.unit,
        )}, on hand ${formatIngredientQty(shortage.available, shortage.unit)}`,
    )
    .join(' • ')
}

export const buildInventoryDeductionNote = (
  ingredients: Ingredient[],
  deductions: InventoryDeduction[],
  orderNo?: string,
) => {
  if (deductions.length === 0) {
    return orderNo ? `Inventory checked for ${orderNo}.` : 'Inventory checked.'
  }

  const ingredientMap = new Map(ingredients.map((item) => [item.id, item]))
  const details = deductions
    .map((deduction) => {
      const ingredient = ingredientMap.get(deduction.ingredientId)
      const name = ingredient?.name ?? 'Unknown ingredient'
      const unit = ingredient?.unit ?? 'pcs'
      return `${name} (-${formatIngredientQty(deduction.qty, unit)})`
    })
    .join('; ')

  return orderNo
    ? `Inventory deducted for ${orderNo}: ${details}.`
    : `Inventory deducted: ${details}.`
}
