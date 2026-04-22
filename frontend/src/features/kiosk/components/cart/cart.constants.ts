export const KIOSK_CART_COPY = {
  clearCart: 'Clear cart',
  emptyDescription: 'Tap a menu item to start your order.',
  emptyTitle: 'Your cart is empty',
  orderNoteLabel: 'Order note',
  orderNotePlaceholder: 'Allergy notes or special requests',
  placeOrder: 'Place order',
  priceSuffix: 'each',
  remove: 'Remove',
  subtotal: 'Subtotal',
  tax: 'Tax (12%)',
  total: 'Total',
} as const

export const KIOSK_CART_STYLES = {
  actionButtonBase:
    'w-full min-h-[38px] rounded-[2px] text-[12px] uppercase tracking-[.08em] font-semibold',
  amountText: 'font-mono text-[12px] text-body',
  card: 'border border-divider rounded-[4px] p-3 bg-paper',
  emptyState:
    'border border-dashed border-divider rounded-[5px] p-4 text-center grid gap-1.5 justify-items-center mb-3',
  iconCircle:
    'w-[42px] h-[42px] border border-dashed border-divider rounded-full grid place-items-center',
  itemRow: 'py-3 border-b border-dashed border-divider',
  metaLabel: 'font-mono text-[10px] uppercase tracking-[.14em] text-muted',
  quantityButton:
    'w-[24px] h-[24px] border border-divider rounded-[2px] bg-paper text-body text-[14px]',
  removeButton: 'text-[11px] text-[#7d2e1d]',
} as const
