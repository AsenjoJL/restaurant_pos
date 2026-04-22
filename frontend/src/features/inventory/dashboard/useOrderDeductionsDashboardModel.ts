import { useMemo } from 'react'
import type { Order } from '../../../shared/types/order'
import { buildInventoryDeductions } from '../inventory.logic'
import type { Ingredient, Recipe } from '../inventory.types'
import type { ConfirmedOrder } from './dashboard.types'

export function useOrderDeductionsDashboardModel({
  orders,
  recipes,
  ingredients,
}: {
  orders: Order[]
  recipes: Recipe[]
  ingredients: Ingredient[]
}) {
  const ingredientById = useMemo(
    () => new Map(ingredients.map((ingredient) => [ingredient.id, ingredient])),
    [ingredients],
  )

  const orderHistory = useMemo<ConfirmedOrder[]>(() => {
    const sorted = [...orders].sort(
      (a, b) => new Date(b.placed_at).getTime() - new Date(a.placed_at).getTime(),
    )

    return sorted.map((order) => {
      const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0)
      const primaryName = order.items[0]?.name ?? 'Order'
      const productName =
        order.items.length > 1 ? `${primaryName} +${order.items.length - 1} more` : primaryName

      const deductions = buildInventoryDeductions(order, recipes, ingredients).map((deduction) => {
        const ingredient = ingredientById.get(deduction.ingredientId)
        return {
          ingredientId: deduction.ingredientId,
          ingredientName: ingredient?.name ?? 'Unknown ingredient',
          qty: deduction.qty,
          unit: ingredient?.baseUnit ?? '',
        }
      })

      const allRaw =
        deductions.length > 0 &&
        deductions.every((deduction) => {
          const ingredient = ingredientById.get(deduction.ingredientId)
          return (ingredient?.ingredientType ?? 'RAW') === 'RAW'
        })

      return {
        id: `existing-${order.id}`,
        orderNo: order.order_no,
        status: order.status,
        productId: order.id,
        productName,
        productType: allRaw ? 'raw' : 'non_raw',
        quantity: itemCount,
        totalPrice: order.total,
        timestamp: order.placed_at,
        deductions,
      }
    })
  }, [ingredientById, ingredients, orders, recipes])

  return {
    orderHistory,
  }
}
