export type ModifierGroup = {
  id: string
  name: string
  selection: 'single' | 'multi'
  options: string[]
}

export const modifierGroupsByCategory: Record<string, ModifierGroup[]> = {
  burgers: [
    {
      id: 'size',
      name: 'Size',
      selection: 'single',
      options: ['Single', 'Double'],
    },
    {
      id: 'prep',
      name: 'Preparation',
      selection: 'single',
      options: ['No onions', 'No pickles', 'Well done'],
    },
    {
      id: 'extras',
      name: 'Add-ons',
      selection: 'multi',
      options: ['Extra cheese', 'Bacon', 'Avocado', 'Jalapenos'],
    },
  ],
  pizza: [
    {
      id: 'size',
      name: 'Size',
      selection: 'single',
      options: ['10 inch', '12 inch', '16 inch'],
    },
    {
      id: 'crust',
      name: 'Crust',
      selection: 'single',
      options: ['Thin', 'Regular', 'Deep dish'],
    },
    {
      id: 'toppings',
      name: 'Toppings',
      selection: 'multi',
      options: ['Pepperoni', 'Mushrooms', 'Olives', 'Extra cheese'],
    },
  ],
  salads: [
    {
      id: 'dressing',
      name: 'Dressing',
      selection: 'single',
      options: ['Vinaigrette', 'Ranch', 'Caesar'],
    },
    {
      id: 'prep',
      name: 'Preparation',
      selection: 'single',
      options: ['No croutons', 'Dressing on side', 'Extra greens'],
    },
    {
      id: 'extras',
      name: 'Add-ons',
      selection: 'multi',
      options: ['Chicken', 'Avocado', 'Boiled egg'],
    },
  ],
  sides: [
    {
      id: 'sauce',
      name: 'Dip',
      selection: 'single',
      options: ['Ketchup', 'Ranch', 'Garlic aioli'],
    },
    {
      id: 'extras',
      name: 'Extras',
      selection: 'multi',
      options: ['Extra sauce', 'Extra seasoning'],
    },
  ],
  drinks: [
    {
      id: 'size',
      name: 'Size',
      selection: 'single',
      options: ['Small', 'Medium', 'Large'],
    },
    {
      id: 'ice',
      name: 'Ice',
      selection: 'single',
      options: ['No ice', 'Light ice', 'Regular ice'],
    },
  ],
  desserts: [
    {
      id: 'temp',
      name: 'Serving',
      selection: 'single',
      options: ['Warm', 'Chilled'],
    },
    {
      id: 'extras',
      name: 'Add-ons',
      selection: 'multi',
      options: ['Whipped cream', 'Berry sauce'],
    },
  ],
}

export const getModifierGroupsForCategory = (categoryId: string | undefined) => {
  if (!categoryId) {
    return []
  }
  return modifierGroupsByCategory[categoryId] ?? []
}
