export type ModifierOption = {
  id: string
  name: string
  priceDelta: number
}

export type ModifierGroup = {
  id: string
  name: string
  required: boolean
  type: 'single' | 'multi'
  minSelect?: number
  maxSelect?: number
  options: ModifierOption[]
}

export type SelectedModifier = {
  groupId: string
  groupName: string
  optionId: string
  name: string
  priceDelta: number
}

export type ProductType = 'ITEM' | 'BUNDLE'

export type BundleGroup = {
  id: string
  label: string
  minSelect: number
  maxSelect: number
  allowedProductIds: string[]
}

export type BundleDefinition = {
  groups: BundleGroup[]
}

export type BundleSelection = {
  groupId: string
  groupLabel: string
  productId: string
  name: string
  price: number
  quantity: number
}

export type OrderType = 'dine-in' | 'takeout'

export type OrderStatus =
  | 'draft'
  | 'held'
  | 'sent'
  | 'preparing'
  | 'ready'
  | 'paid'
  | 'cancelled'

export type MenuCategory = {
  id: string
  name: string
}

export type MenuProduct = {
  id: string
  name: string
  description: string
  price: number
  categoryId: string
  tone: 'sun' | 'mint' | 'berry' | 'ocean' | 'clay' | 'orchard'
  image?: string
  availability?: 'AVAILABLE' | 'LIMITED' | 'SOLD_OUT'
  modifierGroups?: ModifierGroup[]
  type?: ProductType
  bundle?: BundleDefinition
}

export type CartItem = {
  product: MenuProduct
  quantity: number
  note?: string
  selectedModifiers: SelectedModifier[]
  finalUnitPrice: number
  bundleSelections?: BundleSelection[]
}

export type DraftOrder = {
  id: string
  orderType: OrderType
  tableId: string | null
  staffId: string | null
  notes: string
  items: CartItem[]
  discount: number
  serviceCharge: number
  taxRate: number
  status: OrderStatus
}

export type ConfirmIntent = 'void-item' | 'clear-cart' | 'cancel-order'
