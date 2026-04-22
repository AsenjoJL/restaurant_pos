export type ConfirmedOrder = {
  id: string
  orderNo?: string
  status?: string
  productId: string
  productName: string
  productType: 'raw' | 'non_raw'
  quantity: number
  totalPrice: number
  timestamp: string
  deductions: {
    ingredientId: string
    ingredientName: string
    qty: number
    unit: string
  }[]
}

