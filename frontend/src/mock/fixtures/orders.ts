import type { Order } from '../../shared/types/order'
import { calculateOrderTotals } from '../../shared/lib/orders'

const buildOrder = (order: Omit<Order, 'subtotal' | 'tax' | 'total'>): Order => {
  const totals = calculateOrderTotals(order.items)
  return {
    ...order,
    subtotal: totals.subtotal,
    tax: totals.tax,
    total: totals.total,
  }
}

export const orders: Order[] = [
  buildOrder({
    id: 'O-1201',
    order_no: 'S-102',
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
    order_no: 'S-103',
    source: 'KIOSK',
    status: 'SENT_TO_KITCHEN',
    order_type: 'DINE_IN',
    table: 'Table 04',
    items: [
      { id: 'prod-14', name: 'Pepperoni Pizza', price: 360, quantity: 1 },
      {
        id: 'prod-3',
        name: 'Calamaris Rings',
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
    order_no: 'S-104',
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

