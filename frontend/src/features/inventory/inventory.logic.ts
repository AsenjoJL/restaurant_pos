import type { Order } from '../../shared/types/order'
import type {
  Ingredient,
  Recipe,
  InventoryDeduction,
  InventoryShortage,
  InventoryValidation,
} from './inventory.types.ts'
import { convertToBase } from './inventory.conversions'

const formatQtyValue = (value: number) =>
  Number.isInteger(value) ? String(value) : value.toFixed(2)

export const formatIngredientQty = (value: number, unit: Ingredient['baseUnit']) =>
  `${formatQtyValue(value)} ${unit}`

const resolveOrderItemProductId = (
  item: Pick<Order['items'][number], 'id' | 'product_id'>,
) => item.product_id ?? item.id

const buildInventoryDeductionsWithValidation = (
  order: Order,
  recipes: Recipe[],
  ingredients: Ingredient[],
) => {
  const recipeMap = new Map(recipes.map((recipe) => [recipe.productId, recipe]))
  const ingredientMap = new Map(ingredients.map((item) => [item.id, item]))
  const requiredMap = new Map<string, number>()
  const issues: InventoryShortage[] = []

  const addRequirement = (
    ingredientId: string,
    qty: number,
    unit: Recipe['lines'][number]['unit'],
    multiplier: number,
  ) => {
    const ingredient = ingredientMap.get(ingredientId)
    if (!ingredient) {
      issues.push({
        ingredientId,
        name: 'Unknown ingredient',
        unit: 'pcs',
        required: qty * multiplier,
        available: 0,
        deficit: qty * multiplier,
        reorderLevel: 0,
        reason: 'Missing ingredient definition.',
      })
      return
    }
    const conversion = convertToBase(ingredient, qty * multiplier, unit)
    if (!conversion.ok) {
      issues.push({
        ingredientId,
        name: ingredient.name,
        unit: ingredient.baseUnit,
        required: qty * multiplier,
        available: ingredient.onHand,
        deficit: Math.max(qty * multiplier - ingredient.onHand, 0),
        reorderLevel: ingredient.reorderLevel,
        reason: conversion.reason,
      })
      return
    }
    const current = requiredMap.get(ingredientId) ?? 0
    requiredMap.set(ingredientId, current + conversion.baseQty)
  }

  order.items.forEach((item) => {
    if (item.bundle_items && item.bundle_items.length > 0) {
      item.bundle_items.forEach((bundleItem) => {
        const recipe = recipeMap.get(bundleItem.product_id ?? bundleItem.id)
        if (!recipe) {
          return
        }
        recipe.lines.forEach((line) => {
          addRequirement(
            line.ingredientId,
            line.qty,
            line.unit,
            bundleItem.quantity * item.quantity,
          )
        })
      })
      return
    }

    const recipe = recipeMap.get(resolveOrderItemProductId(item))
    if (!recipe) {
      return
    }
    recipe.lines.forEach((line) => {
      addRequirement(line.ingredientId, line.qty, line.unit, item.quantity)
    })
  })

  return {
    deductions: Array.from(requiredMap.entries()).map(([ingredientId, qty]) => ({
      ingredientId,
      qty,
    })),
    issues,
  }
}

export const buildInventoryDeductionsForRefund = (
  order: Order,
  refundItems: { id: string; qty: number }[],
  recipes: Recipe[],
  ingredients: Ingredient[],
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

  return buildInventoryDeductions({ ...order, items }, recipes, ingredients)
}

export const buildInventoryDeductions = (
  order: Order,
  recipes: Recipe[],
  ingredients: Ingredient[],
): InventoryDeduction[] =>
  buildInventoryDeductionsWithValidation(order, recipes, ingredients).deductions

export const validateInventoryForOrder = (
  order: Order,
  recipes: Recipe[],
  ingredients: Ingredient[],
): InventoryValidation => {
  const { deductions, issues } = buildInventoryDeductionsWithValidation(
    order,
    recipes,
    ingredients,
  )
  if (deductions.length === 0 && issues.length === 0) {
    return { ok: true, deductions, shortages: [] }
  }

  const ingredientMap = new Map(ingredients.map((item) => [item.id, item]))
  const shortages: InventoryShortage[] = [...issues]

  deductions.forEach((deduction) => {
    const ingredient = ingredientMap.get(deduction.ingredientId)
    const available = ingredient?.onHand ?? 0
    if (available < deduction.qty) {
      shortages.push({
        ingredientId: deduction.ingredientId,
        name: ingredient?.name ?? 'Unknown ingredient',
        unit: ingredient?.baseUnit ?? 'pcs',
        required: deduction.qty,
        available,
        deficit: deduction.qty - available,
        reorderLevel: ingredient?.reorderLevel ?? 0,
      })
    }
  })

  return { ok: shortages.length === 0, deductions, shortages }
}

export const buildInventoryShortageMessage = (shortages: InventoryShortage[]) => {
  if (shortages.length === 0) {
    return ''
  }

  const hasAboveReorderShortage = shortages.some(
    (shortage) =>
      shortage.reason === undefined &&
      shortage.reorderLevel !== undefined &&
      shortage.available > shortage.reorderLevel,
  )

  const shortageDetails = shortages
    .map(
      (shortage) =>
        shortage.reason
          ? `${shortage.name}: ${shortage.reason}`
          : `${shortage.name}: need ${formatIngredientQty(shortage.required, shortage.unit)}, on hand ${formatIngredientQty(
              shortage.available,
              shortage.unit,
            )}${shortage.reorderLevel !== undefined ? `, reorder ${formatIngredientQty(shortage.reorderLevel, shortage.unit)}` : ''}`,
    )
    .join(' • ')

  if (hasAboveReorderShortage) {
    return `Some items are above reorder level but still below the recipe needed for this order. ${shortageDetails}`
  }

  return shortageDetails
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
      const unit = ingredient?.baseUnit ?? 'pcs'
      return `${name} (-${formatIngredientQty(deduction.qty, unit)})`
    })
    .join('; ')

  return orderNo
    ? `Inventory deducted for ${orderNo}: ${details}.`
    : `Inventory deducted: ${details}.`
}

export const calculateRecipeCost = (
  recipeLines: Recipe['lines'],
  ingredients: Ingredient[],
) => {
  const ingredientMap = new Map(ingredients.map((item) => [item.id, item]))
  return recipeLines.reduce((sum, line) => {
    const ingredient = ingredientMap.get(line.ingredientId)
    const unitCost = ingredient?.unitCost ?? 0
    if (!ingredient) {
      return sum
    }
    const conversion = convertToBase(ingredient, line.qty, line.unit)
    if (!conversion.ok) {
      return sum
    }
    return sum + unitCost * conversion.baseQty
  }, 0)
}

export const calculateOrderCost = (
  order: Order,
  recipes: Recipe[],
  ingredients: Ingredient[],
) => {
  const deductions = buildInventoryDeductions(order, recipes, ingredients)
  if (deductions.length === 0) {
    return 0
  }
  const ingredientMap = new Map(ingredients.map((item) => [item.id, item]))
  return deductions.reduce((sum, deduction) => {
    const ingredient = ingredientMap.get(deduction.ingredientId)
    const unitCost = ingredient?.unitCost ?? 0
    return sum + unitCost * deduction.qty
  }, 0)
}

export type InventoryAvailability = 'AVAILABLE' | 'LIMITED' | 'SOLD_OUT'

export const getInventoryAvailabilityForProduct = (
  productId: string,
  recipes: Recipe[],
  ingredients: Ingredient[],
): InventoryAvailability | null => {
  const recipe = recipes.find((item) => item.productId === productId)
  if (!recipe) {
    return null
  }
  const ingredientMap = new Map(ingredients.map((item) => [item.id, item]))
  let isLimited = false
  for (const line of recipe.lines) {
    const ingredient = ingredientMap.get(line.ingredientId)
    if (!ingredient) {
      return 'SOLD_OUT'
    }
    const conversion = convertToBase(ingredient, line.qty, line.unit)
    if (!conversion.ok) {
      return 'SOLD_OUT'
    }
    if (ingredient.onHand < conversion.baseQty) {
      return 'SOLD_OUT'
    }
    if (ingredient.onHand <= ingredient.reorderLevel) {
      isLimited = true
    }
  }
  return isLimited ? 'LIMITED' : 'AVAILABLE'
}

export const buildInventoryAvailabilityMap = (
  productIds: string[],
  recipes: Recipe[],
  ingredients: Ingredient[],
) =>
  new Map(
    productIds.map((productId) => [
      productId,
      getInventoryAvailabilityForProduct(productId, recipes, ingredients),
    ]),
  )

export const resolveAvailability = (
  baseAvailability: InventoryAvailability | undefined,
  inventoryAvailability: InventoryAvailability | null,
): InventoryAvailability => {
  if (baseAvailability === 'SOLD_OUT' || inventoryAvailability === 'SOLD_OUT') {
    return 'SOLD_OUT'
  }
  if (baseAvailability === 'LIMITED' || inventoryAvailability === 'LIMITED') {
    return 'LIMITED'
  }
  return 'AVAILABLE'
}
