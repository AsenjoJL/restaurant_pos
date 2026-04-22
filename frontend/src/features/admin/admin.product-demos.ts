import { nanoid } from '@reduxjs/toolkit'
import type { MeasurementUnit } from '../inventory/inventory.types'
import { createEmptyRecipeLine, type ProductFormState } from './admin.products-form'

type DemoProductKey = 'espresso' | 'cheeseburger' | 'coffeeBeans'

type DemoProductDraft = Pick<
  ProductFormState,
  | 'productType'
  | 'name'
  | 'category'
  | 'productClass'
  | 'description'
  | 'currentStock'
  | 'unit'
  | 'lowStockAlert'
  | 'unitCost'
  | 'costPrice'
  | 'sellingPrice'
  | 'recipeLines'
>

export const demoProducts: Record<DemoProductKey, DemoProductDraft> = {
  espresso: {
    productType: 'non_raw',
    name: 'Espresso',
    category: 'beverages',
    productClass: 'premium',
    description: 'Rich, bold espresso shot made from premium Arabica beans',
    currentStock: '',
    unit: '',
    lowStockAlert: '',
    unitCost: '',
    costPrice: '25.00',
    sellingPrice: '45.00',
    recipeLines: [
      { id: nanoid(), ingredientId: 'coffee-beans', qty: '18', unit: 'g' },
      { id: nanoid(), ingredientId: 'milk', qty: '60', unit: 'ml' },
    ],
  },
  cheeseburger: {
    productType: 'non_raw',
    name: 'Cheeseburger',
    category: 'food',
    productClass: 'standard',
    description: 'Classic cheeseburger with lettuce, tomato, and special sauce',
    currentStock: '',
    unit: '',
    lowStockAlert: '',
    unitCost: '',
    costPrice: '85.00',
    sellingPrice: '150.00',
    recipeLines: [
      { id: nanoid(), ingredientId: 'beef-patty', qty: '150', unit: 'g' },
      { id: nanoid(), ingredientId: 'cheese-slice', qty: '1', unit: 'pcs' },
      { id: nanoid(), ingredientId: 'bun', qty: '1', unit: 'pcs' },
      { id: nanoid(), ingredientId: 'lettuce', qty: '20', unit: 'g' },
      { id: nanoid(), ingredientId: 'tomato', qty: '30', unit: 'g' },
    ],
  },
  coffeeBeans: {
    productType: 'raw',
    name: 'Coffee Beans',
    category: 'beverages',
    productClass: 'premium',
    description: 'Premium Arabica coffee beans, freshly roasted',
    currentStock: '5000',
    unit: 'g',
    lowStockAlert: '1000',
    unitCost: '8.50',
    costPrice: '',
    sellingPrice: '12.00',
    recipeLines: [createEmptyRecipeLine()],
  },
}

export const mapDemoRecipeUnits = (draft: DemoProductDraft) =>
  draft.recipeLines.map((line) => ({
    ...line,
    unit: line.unit as MeasurementUnit | '',
  }))

export type { DemoProductKey }
