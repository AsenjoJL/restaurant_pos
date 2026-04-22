export type ConfirmIntent = 'void-item' | 'clear-cart' | 'cancel-order'

export const confirmTitleMap: Record<ConfirmIntent, string> = {
  'void-item': 'Void Item',
  'clear-cart': 'Clear Cart',
  'cancel-order': 'Cancel Order',
}

export const confirmDescriptionMap: Record<ConfirmIntent, string> = {
  'void-item': 'Provide a reason for voiding this item.',
  'clear-cart': 'This will remove all items from the cart.',
  'cancel-order': 'Provide a reason for cancelling this order.',
}

export const confirmLabelMap: Record<ConfirmIntent, string> = {
  'void-item': 'Void Item',
  'clear-cart': 'Clear Cart',
  'cancel-order': 'Cancel Order',
}

export function requiresReason(intent: ConfirmIntent | null): boolean {
  if (!intent) return false
  return intent === 'void-item' || intent === 'cancel-order'
}
