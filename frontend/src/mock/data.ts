import type { MenuCategory, MenuProduct } from '../features/pos/pos.types'
import type { Role } from '../features/auth/auth.types'
import type { Order } from '../shared/types/order'
import { calculateOrderTotals } from '../shared/lib/orders'

export type MockUser = {
  id: string
  name: string
  role: Role
  username: string
  pin: string
}

export type MockTable = {
  id: string
  name: string
}

// All categories

export type MockOrder = Order

export const categories: MenuCategory[] = [
  { id: 'all', name: 'All Items' },
  { id: 'appetizers', name: 'Appetizers' },
  { id: 'rice-meals', name: 'Rice Meals' },
  { id: 'pasta', name: 'Pasta' },
  { id: 'burgers-sandwiches', name: 'Burgers & Sandwiches' },
  { id: 'pizza', name: 'Pizza' },
  { id: 'chicken-meals', name: 'Chicken Meals' },
  { id: 'seafood', name: 'Seafood' },
  { id: 'asian-local', name: 'Asian/Local Specialties' },
  { id: 'desserts', name: 'Desserts' },
  { id: 'soft-drinks', name: 'Soft Drinks' },
  { id: 'coffee', name: 'Coffee' },
  { id: 'tea', name: 'Tea' },
  { id: 'shakes-smoothies', name: 'Shakes & Smoothies' },
  { id: 'sides-extras', name: 'Sides & Extras' },
]

// products images source file

const productImages: Record<string, string> = {
  'Lumpia Shanghai': '/lumpia.jpg',
  'Mozzarella Sticks': '/mozarilla sticks.jpg',
  'Calamari Rings': '/calamari rings.jpg',
  'Grilled Pork Chop': '/grilled pork chop.jpg',
  'Beef Tapa': '/beef tapa.jpg',
  'Chicken BBQ': '/chickenbbq.jpg',
  'Spaghetti Bolognese': '/spaghetti.jpg',
  'Carbonara': '/carbonara.jpg',
  'Seafood Aglio Olio': '/seafood aglio olio.jpg',
  'Classic Beef Burger': '/burger.png',
  'Crispy Chicken Burger': '/burger1.jpg',
  'Clubhouse Sandwich': '/burger1.jpg',
  'Margherita Pizza': '/pizza.jpg',
  'Pepperoni Pizza': '/pizza.jpg',
  'Hawaiian Pizza': '/pizza.jpg',
  'Fried Chicken Plate': '/fried chicken plate.jpg',
  'Chicken Teriyaki': '/chicken teriyaki.jpg',
  'Chicken Inasal': '/chicken inasal.jpg',
  'Grilled Salmon': '/salmon.jpg',
  'Garlic Butter Shrimp': '/shrimp.jpg',
  'Sweet Chili Fish': '/chilliFish.jpg',
  'Pork Sisig': '/pork sisig.jpg',
  'Beef Kare-Kare': '/beef kari kari.jpg',
  'Chicken Adobo': '/adobo.jpg',
  'Leche Flan': '/leche flan.jpg',
  'Ube Cheesecake': '/ube cheesecake.jpg',
  'Halo-Halo Cup': '/halo halo cup.jpg',
  'Cola Regular': '/cola regular.jpg',
  'Lemon-Lime Soda': '/lemon lime soda.jpg',
  'Root Beer': '/rootBeer.jpg',
  'Brewed Coffee': '/brewed coffee.jpg',
  'Iced Latte': '/ice latte.jpg',
  'Caramel Macchiato': '/caramel machiatto.jpg',
  'Hot Black Tea': '/hot black tea.jpg',
  'Iced Lemon Tea': '/ice lemon tea.jpg',
  'Matcha Latte': '/matcha latte.jpg',
  'Mango Smoothie': '/mango smoothie.jpg',
  'Strawberry Shake': '/strawberry shake.jpg',
  'Garlic Rice': '/garlic rice.jpg',
  'Steamed Rice': '/steamed rice.jpg',
  'Cheese Fries': '/cheese fries.jpg',
  'Tuna Steak': '/tuna-steak.jpg',
  'Cock tail': '/cocktail.jpg',
  'dasani': '/dasane.jpg',
}

const productAvailability: Record<string, MenuProduct['availability']> = {
  'Garlic Butter Shrimp': 'LIMITED',
  'Grilled Salmon': 'LIMITED',
  'Halo-Halo Cup': 'LIMITED',
  'Seafood Aglio Olio': 'LIMITED',
  'Pepperoni Pizza': 'SOLD_OUT',
  'Mango Smoothie': 'SOLD_OUT',
}

/* ===============================
   Modifier Groups (Examples)
   =============================== */
const burgerModifiers: MenuProduct['modifierGroups'] = [
  {
    id: 'bun',
    name: 'Bun',
    required: true,
    type: 'single',
    minSelect: 1,
    maxSelect: 1,
    options: [
      { id: 'bun-regular', name: 'Regular bun', priceDelta: 0 },
      { id: 'bun-brioche', name: 'Brioche bun', priceDelta: 15 },
    ],
  },
  {
    id: 'addons',
    name: 'Add-ons',
    required: false,
    type: 'multi',
    minSelect: 0,
    maxSelect: 3,
    options: [
      { id: 'add-cheese', name: 'Cheddar', priceDelta: 15 },
      { id: 'add-bacon', name: 'Bacon', priceDelta: 25 },
      { id: 'add-egg', name: 'Fried egg', priceDelta: 20 },
    ],
  },
]

const pizzaModifiers: MenuProduct['modifierGroups'] = [
  {
    id: 'size',
    name: 'Size',
    required: true,
    type: 'single',
    minSelect: 1,
    maxSelect: 1,
    options: [
      { id: 'size-9', name: '9 inch', priceDelta: 0 },
      { id: 'size-12', name: '12 inch', priceDelta: 120 },
    ],
  },
  {
    id: 'toppings',
    name: 'Extra Toppings',
    required: false,
    type: 'multi',
    minSelect: 0,
    maxSelect: 3,
    options: [
      { id: 'top-mushroom', name: 'Mushroom', priceDelta: 25 },
      { id: 'top-olives', name: 'Olives', priceDelta: 20 },
      { id: 'top-extra-cheese', name: 'Extra cheese', priceDelta: 30 },
    ],
  },
]

const latteModifiers: MenuProduct['modifierGroups'] = [
  {
    id: 'milk',
    name: 'Milk',
    required: true,
    type: 'single',
    minSelect: 1,
    maxSelect: 1,
    options: [
      { id: 'milk-regular', name: 'Regular milk', priceDelta: 0 },
      { id: 'milk-oat', name: 'Oat milk', priceDelta: 20 },
    ],
  },
  {
    id: 'shots',
    name: 'Extra shots',
    required: false,
    type: 'multi',
    minSelect: 0,
    maxSelect: 2,
    options: [
      { id: 'shot-1', name: '1 extra shot', priceDelta: 25 },
      { id: 'shot-2', name: '2 extra shots', priceDelta: 50 },
    ],
  },
]

// product menu per category

const baseProducts: MenuProduct[] = [
  {
    id: 'prod-1',
    name: 'Lumpia Shanghai',
    description: 'Crispy rolls, sweet chili dip',
    price: 165,
    categoryId: 'appetizers',
    tone: 'sun',
  },
  {
    id: 'prod-2',
    name: 'Mozzarella Sticks',
    description: 'Melty cheese, marinara dip',
    price: 190,
    categoryId: 'appetizers',
    tone: 'clay',
  },
  {
    id: 'prod-3',
    name: 'Calamari Rings',
    description: 'Lightly fried, garlic aioli',
    price: 220,
    categoryId: 'appetizers',
    tone: 'ocean',
  },
  {
    id: 'prod-4',
    name: 'Grilled Pork Chop',
    description: 'Smoky glaze, garlic rice',
    price: 210,
    categoryId: 'rice-meals',
    tone: 'orchard',
  },
  {
    id: 'prod-5',
    name: 'Beef Tapa',
    description: 'Cured beef, fried egg',
    price: 195,
    categoryId: 'rice-meals',
    tone: 'berry',
  },
  {
    id: 'prod-6',
    name: 'Chicken BBQ',
    description: 'Chargrilled chicken, java rice',
    price: 205,
    categoryId: 'rice-meals',
    tone: 'mint',
  },
  {
    id: 'prod-7',
    name: 'Spaghetti Bolognese',
    description: 'Meaty sauce, parmesan',
    price: 210,
    categoryId: 'pasta',
    tone: 'sun',
  },
  {
    id: 'prod-8',
    name: 'Carbonara',
    description: 'Creamy bacon, mushroom',
    price: 220,
    categoryId: 'pasta',
    tone: 'clay',
  },
  {
    id: 'prod-9',
    name: 'Seafood Aglio Olio',
    description: 'Shrimp, garlic, chili',
    price: 240,
    categoryId: 'pasta',
    tone: 'ocean',
  },
  {
    id: 'prod-10',
    name: 'Classic Beef Burger',
    description: 'Grilled beef, cheddar, lettuce',
    price: 195,
    categoryId: 'burgers-sandwiches',
    tone: 'sun',
    modifierGroups: burgerModifiers,
  },
  {
    id: 'prod-11',
    name: 'Crispy Chicken Burger',
    description: 'Crispy thigh, spicy mayo',
    price: 185,
    categoryId: 'burgers-sandwiches',
    tone: 'berry',
    modifierGroups: burgerModifiers,
  },
  {
    id: 'prod-12',
    name: 'Clubhouse Sandwich',
    description: 'Turkey, bacon, tomato',
    price: 175,
    categoryId: 'burgers-sandwiches',
    tone: 'orchard',
  },
  {
    id: 'prod-13',
    name: 'Margherita Pizza',
    description: 'Tomato, basil, mozzarella',
    price: 320,
    categoryId: 'pizza',
    tone: 'mint',
    modifierGroups: pizzaModifiers,
  },
  {
    id: 'prod-14',
    name: 'Pepperoni Pizza',
    description: 'Pepperoni, mozzarella, oregano',
    price: 360,
    categoryId: 'pizza',
    tone: 'clay',
    modifierGroups: pizzaModifiers,
  },
  {
    id: 'prod-15',
    name: 'Hawaiian Pizza',
    description: 'Ham, pineapple, mozzarella',
    price: 340,
    categoryId: 'pizza',
    tone: 'sun',
    modifierGroups: pizzaModifiers,
  },
  {
    id: 'prod-16',
    name: 'Fried Chicken Plate',
    description: 'Crispy thigh, gravy rice',
    price: 185,
    categoryId: 'chicken-meals',
    tone: 'berry',
  },
  {
    id: 'prod-17',
    name: 'Chicken Teriyaki',
    description: 'Teriyaki glaze, sesame rice',
    price: 205,
    categoryId: 'chicken-meals',
    tone: 'ocean',
  },
  {
    id: 'prod-18',
    name: 'Chicken Inasal',
    description: 'Grilled chicken, atsara rice',
    price: 195,
    categoryId: 'chicken-meals',
    tone: 'orchard',
  },
  {
    id: 'prod-19',
    name: 'Grilled Salmon',
    description: 'Lemon butter, herb rice',
    price: 350,
    categoryId: 'seafood',
    tone: 'ocean',
  },
  {
    id: 'prod-20',
    name: 'Garlic Butter Shrimp',
    description: 'Juicy shrimp, garlic rice',
    price: 320,
    categoryId: 'seafood',
    tone: 'sun',
  },
  {
    id: 'prod-21',
    name: 'Sweet Chili Fish',
    description: 'Crispy fillet, chili glaze',
    price: 260,
    categoryId: 'seafood',
    tone: 'mint',
  },
  {
    id: 'prod-22',
    name: 'Pork Sisig',
    description: 'Sizzling pork, calamansi',
    price: 240,
    categoryId: 'asian-local',
    tone: 'clay',
  },
  {
    id: 'prod-23',
    name: 'Beef Kare-Kare',
    description: 'Peanut stew, bagoong',
    price: 260,
    categoryId: 'asian-local',
    tone: 'orchard',
  },
  {
    id: 'prod-24',
    name: 'Chicken Adobo',
    description: 'Soy braise, garlic rice',
    price: 190,
    categoryId: 'asian-local',
    tone: 'berry',
  },
  {
    id: 'prod-25',
    name: 'Leche Flan',
    description: 'Creamy custard, caramel',
    price: 120,
    categoryId: 'desserts',
    tone: 'sun',
  },
  {
    id: 'prod-26',
    name: 'Ube Cheesecake',
    description: 'Purple yam, cream cheese',
    price: 160,
    categoryId: 'desserts',
    tone: 'berry',
  },
  {
    id: 'prod-27',
    name: 'Halo-Halo Cup',
    description: 'Shaved ice, sweet beans',
    price: 180,
    categoryId: 'desserts',
    tone: 'ocean',
  },
  {
    id: 'prod-28',
    name: 'Cola Regular',
    description: 'Chilled classic cola',
    price: 70,
    categoryId: 'soft-drinks',
    tone: 'mint',
  },
  {
    id: 'prod-29',
    name: 'Lemon-Lime Soda',
    description: 'Citrus soda, served cold',
    price: 70,
    categoryId: 'soft-drinks',
    tone: 'sun',
  },
  {
    id: 'prod-30',
    name: 'Root Beer',
    description: 'Creamy root beer',
    price: 75,
    categoryId: 'soft-drinks',
    tone: 'clay',
  },
  {
    id: 'prod-31',
    name: 'Brewed Coffee',
    description: 'Hot brewed arabica',
    price: 90,
    categoryId: 'coffee',
    tone: 'orchard',
  },
  {
    id: 'prod-32',
    name: 'Iced Latte',
    description: 'Espresso, milk, ice',
    price: 130,
    categoryId: 'coffee',
    tone: 'ocean',
    modifierGroups: latteModifiers,
  },
  {
    id: 'prod-33',
    name: 'Caramel Macchiato',
    description: 'Caramel espresso, steamed milk',
    price: 150,
    categoryId: 'coffee',
    tone: 'berry',
    modifierGroups: latteModifiers,
  },
  {
    id: 'prod-34',
    name: 'Hot Black Tea',
    description: 'Bold black tea',
    price: 70,
    categoryId: 'tea',
    tone: 'mint',
  },
  {
    id: 'prod-35',
    name: 'Iced Lemon Tea',
    description: 'Citrus tea, served cold',
    price: 85,
    categoryId: 'tea',
    tone: 'sun',
  },
  {
    id: 'prod-36',
    name: 'Matcha Latte',
    description: 'Earthy matcha, milk',
    price: 120,
    categoryId: 'tea',
    tone: 'clay',
    modifierGroups: latteModifiers,
  },
  {
    id: 'prod-37',
    name: 'Chocolate Milkshake',
    description: 'Rich chocolate, whipped cream',
    price: 150,
    categoryId: 'shakes-smoothies',
    tone: 'berry',
  },
  {
    id: 'prod-38',
    name: 'Mango Smoothie',
    description: 'Ripe mango, yogurt blend',
    price: 140,
    categoryId: 'shakes-smoothies',
    tone: 'sun',
  },
  {
    id: 'prod-39',
    name: 'Strawberry Shake',
    description: 'Strawberry cream, milk',
    price: 145,
    categoryId: 'shakes-smoothies',
    tone: 'orchard',
  },
  {
    id: 'prod-40',
    name: 'Garlic Rice',
    description: 'Fragrant garlic rice',
    price: 60,
    categoryId: 'sides-extras',
    tone: 'clay',
  },
  {
    id: 'prod-41',
    name: 'Steamed Rice',
    description: 'Plain steamed rice',
    price: 50,
    categoryId: 'sides-extras',
    tone: 'mint',
  },
  {
    id: 'prod-42',
    name: 'Cheese Fries',
    description: 'Fries, melted cheese',
    price: 120,
    categoryId: 'sides-extras',
    tone: 'sun',
  },
  {
    id: 'prod-43',
    name: 'Tuna Steak',
    description: ' Fresh Tuna, Salt pepper, and oil ',
    price: 200,
    categoryId: 'seafood',
    tone: 'sun',
  },
  {
    id: 'prod-44',
    name: 'Cock tail',
    description: 'Old fashioned, Daiquiri, Margarita',
    price: 250,
    categoryId: 'soft-drinks',
    tone: 'mint',
  },
  {
    id: 'prod-45',
    name: 'dasani',
    description: 'Purified water-view calories, protein, carbs',
    price: 230,
    categoryId: 'soft-drinks',
    tone: 'mint',
  },
]

// table number for dine-in customers

export const products: MenuProduct[] = baseProducts.map((product) => ({
  ...product,
  image: productImages[product.name],
  availability: productAvailability[product.name] ?? 'AVAILABLE',
}))

export const tables: MockTable[] = [
  { id: 't-01', name: 'Table 01' },
  { id: 't-02', name: 'Table 02' },
  { id: 't-03', name: 'Table 03' },
  { id: 't-04', name: 'Table 04' },
  { id: 't-05', name: 'table 05' },
  { id: 't-06', name: 'table 06' },
  { id: 't-07', name: 'table 07' },
  { id: 't-08', name: 'table 08' },
  { id: 't-09', name: 'table 09' },
  { id: 't-10', name: 'table 10' },
  { id: 'bar-1', name: 'Bar 1' },
  { id: 'bar-2', name: 'Bar 2' },
  { id: 'bar-3', name: 'Bar 3' },
  { id: 'bar-4', name: 'Bar 4' },
  { id: 'bar-5', name: 'Bar-5' },
  { id: 'bar-6', name: 'Bar-6' },
  { id: 'bar-7', name: 'Bar-7' },
  { id: 'bar-8', name: 'Bar-8' },
  { id: 'bar-9', name: 'Bar-9' },
  { id: 'bar-10', name: 'Bar-10' },
]

// For user login credentials

export const users: MockUser[] = [
  { id: 'u-1', name: 'Lester Admin', role: 'admin', username: 'admin', pin: '1111' },
  { id: 'u-2', name: 'John Cashier', role: 'cashier', username: 'cashier', pin: '2222' },
  { id: 'u-3', name: 'Asenjo Kitchen', role: 'kitchen', username: 'kitchen', pin: '3333' },
]

const buildOrder = (order: Omit<MockOrder, 'subtotal' | 'tax' | 'total'>): MockOrder => {
  const totals = calculateOrderTotals(order.items)
  return {
    ...order,
    subtotal: totals.subtotal,
    tax: totals.tax,
    total: totals.total,
  }
}

export const orders: MockOrder[] = [
  buildOrder({
    id: 'O-1201',
    order_no: 'A-102',
    source: 'KIOSK',
    status: 'PENDING_PAYMENT',
    order_type: 'TAKEOUT',
    table: null,
    items: [
      { id: 'prod-10', name: 'Classic Beef Burger', price: 195, quantity: 1 },
      { id: 'prod-28', name: 'Cola Regular', price: 70, quantity: 1 },
    ],
    note: 'No ketchup packets.',
    placed_at: '2026-02-13T10:05:00Z',
    audit_log: [],
  }),
  buildOrder({
    id: 'O-1202',
    order_no: 'A-103',
    source: 'KIOSK',
    status: 'SENT_TO_KITCHEN',
    order_type: 'DINE_IN',
    table: 'Table 04',
    items: [
      { id: 'prod-14', name: 'Pepperoni Pizza', price: 360, quantity: 1 },
      {
        id: 'prod-3',
        name: 'Calamari Rings',
        price: 220,
        quantity: 1,
        modifiers: ['Extra cheese'],
      },
    ],
    placed_at: '2026-02-13T10:08:00Z',
    audit_log: [],
  }),
  buildOrder({
    id: 'O-1203',
    order_no: 'S-204',
    source: 'STAFF',
    status: 'HOLD',
    order_type: 'DINE_IN',
    table: 'Table 02',
    items: [
      { id: 'prod-24', name: 'Chicken Adobo', price: 190, quantity: 1 },
      { id: 'prod-32', name: 'Iced Latte', price: 130, quantity: 2 },
    ],
    placed_at: '2026-02-13T10:12:00Z',
    audit_log: [],
  }),
  buildOrder({
    id: 'O-1204',
    order_no: 'S-205',
    source: 'STAFF',
    status: 'PREPARING',
    order_type: 'TAKEOUT',
    table: null,
    items: [
      { id: 'prod-17', name: 'Chicken Teriyaki', price: 205, quantity: 1 },
      { id: 'prod-2', name: 'Mozzarella Sticks', price: 190, quantity: 1 },
    ],
    placed_at: '2026-02-13T10:15:00Z',
    audit_log: [],
  }),
  buildOrder({
    id: 'O-1205',
    order_no: 'A-104',
    source: 'KIOSK',
    status: 'READY_FOR_PICKUP',
    order_type: 'TAKEOUT',
    table: null,
    items: [{ id: 'prod-25', name: 'Leche Flan', price: 120, quantity: 1 }],
    placed_at: '2026-02-13T10:20:00Z',
    audit_log: [],
  }),
  buildOrder({
    id: 'O-1206',
    order_no: 'S-206',
    source: 'STAFF',
    status: 'CANCELLED',
    order_type: 'TAKEOUT',
    table: null,
    items: [{ id: 'prod-27', name: 'Halo-Halo Cup', price: 180, quantity: 2 }],
    placed_at: '2026-02-13T10:22:00Z',
    audit_log: [
      {
        id: 'audit-1',
        action: 'CANCEL',
        note: 'Customer no-show.',
        at: '2026-02-13T10:23:00Z',
      },
    ],
  }),
]
