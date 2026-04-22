import type { MenuCategory } from '../../features/pos/pos.types'

export const categories: MenuCategory[] = [
  { id: 'chicken', name: 'Chicken', station: 'FRY' },
  { id: 'seafood', name: 'Seafood', station: 'GRILL' },
  { id: 'pork', name: 'Pork', station: 'GRILL' },
  { id: 'sides', name: 'Sides', station: 'PANTRY' },
  { id: 'rice', name: 'Rice & Noodles', station: 'PANTRY' },
  { id: 'drinks', name: 'Drinks', station: 'BAR' },
  { id: 'desserts', name: 'Desserts', station: 'DESSERT' },
  { id: 'appetizers', name: 'Appetizers', station: 'FRY' },
] as const

