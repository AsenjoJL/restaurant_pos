export const POS_CART_TABLE_OPTIONS = [
  { value: '', label: 'Select table' },
  ...Array.from({ length: 20 }, (_, index) => ({
    value: `Table ${index + 1}`,
    label: `Table ${index + 1}`,
  })),
]
