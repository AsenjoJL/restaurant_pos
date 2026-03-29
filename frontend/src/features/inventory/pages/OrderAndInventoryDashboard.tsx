import { useMemo, useState } from 'react'
import { useAppSelector } from '../../../app/store/hooks'
import { formatCurrency } from '../../../shared/lib/format'
import { selectOrders } from '../../orders/orders.selectors'
import { selectInventoryIngredients, selectInventoryRecipes } from '../inventory.selectors'
import { buildInventoryDeductions } from '../inventory.logic'

// ============================================================
// Types
// ============================================================

type ConfirmedOrder = {
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

// ============================================================
// Panel: Order History
// ============================================================

function OrderHistoryPanel({
  orders,
  isEmpty,
}: {
  orders: ConfirmedOrder[]
  isEmpty: boolean
}) {
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)

  const totalRevenue = useMemo(
    () => orders.reduce((sum, order) => sum + order.totalPrice, 0),
    [orders],
  )

  if (isEmpty) {
    return (
      <div className="panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: '#111827' }}>
          Order History
        </h3>
        <div
          style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#9ca3af',
          }}
        >
          <div style={{ fontSize: '16px', fontWeight: '500' }}>No orders yet</div>
          <div style={{ fontSize: '13px', marginTop: '8px' }}>
            Confirmed orders will appear here
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: '#111827' }}>
        Order History
      </h3>

      <div
        style={{
          backgroundColor: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '20px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', marginBottom: '4px' }}>
          TOTAL REVENUE
        </div>
        <div style={{ fontSize: '24px', fontWeight: '700', color: '#111827' }}>
          {formatCurrency(totalRevenue)}
        </div>
      </div>

      <div style={{ overflowY: 'auto', flex: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {orders.map((order) => (
            <div
              key={order.id}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                overflow: 'hidden',
              }}
            >
              <div
                onClick={() =>
                  setExpandedOrderId(expandedOrderId === order.id ? null : order.id)
                }
                style={{
                  padding: '12px 16px',
                  backgroundColor: '#f9fafb',
                  cursor: 'pointer',
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 1fr auto',
                  gap: '12px',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#111827' }}>
                    {order.orderNo ? `${order.orderNo} • ${order.productName}` : order.productName}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                    {new Date(order.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                <div style={{ textAlign: 'center', fontSize: '13px', color: '#374151' }}>
                  Qty: <strong>{order.quantity}</strong>
                </div>
                <div style={{ textAlign: 'center', fontSize: '13px', color: '#374151' }}>
                  {formatCurrency(order.totalPrice)}
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '4px 8px',
                      backgroundColor:
                        order.status === 'CANCELLED'
                          ? '#fee2e2'
                          : order.productType === 'raw'
                            ? '#fef3c7'
                            : '#dbeafe',
                      color:
                        order.status === 'CANCELLED'
                          ? '#991b1b'
                          : order.productType === 'raw'
                            ? '#92400e'
                            : '#1e40af',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: '600',
                    }}
                  >
                    {order.status === 'CANCELLED'
                      ? 'Cancelled'
                      : order.productType === 'raw'
                        ? 'Raw'
                        : 'Finished'}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: '18px',
                    color: '#9ca3af',
                    transform:
                      expandedOrderId === order.id ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s',
                  }}
                >
                  ▼
                </div>
              </div>

              {expandedOrderId === order.id && (
                <div style={{ padding: '16px', backgroundColor: 'white', borderTop: '1px solid #e5e7eb' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '12px' }}>
                    INGREDIENT DEDUCTIONS
                  </div>
                  {order.deductions.length === 0 ? (
                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                      No recipe-linked ingredient deductions available for this order.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {order.deductions.map((ded, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '2fr 1fr',
                            gap: '12px',
                            padding: '8px',
                            backgroundColor: '#f9fafb',
                            borderRadius: '4px',
                            fontSize: '13px',
                            color: '#374151',
                          }}
                        >
                          <div>{ded.ingredientName}</div>
                          <div style={{ textAlign: 'right' }}>
                            -{ded.qty}
                            {ded.unit}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================================
// Main Dashboard Component
// ============================================================

export default function OrderAndInventoryDashboard() {
  const ingredients = useAppSelector(selectInventoryIngredients)
  const recipes = useAppSelector(selectInventoryRecipes)
  const existingOrders = useAppSelector(selectOrders)

  const ingredientNameToType = useMemo(
    () =>
      new Map(
        ingredients.map((ingredient) => [
          ingredient.name.trim().toLowerCase(),
          ingredient.ingredientType ?? 'RAW',
        ]),
      ),
    [ingredients],
  )
  const ingredientById = useMemo(
    () => new Map(ingredients.map((ingredient) => [ingredient.id, ingredient])),
    [ingredients],
  )

  const existingOrderHistory = useMemo<ConfirmedOrder[]>(() => {
    return [...existingOrders]
      .sort(
        (a, b) =>
          new Date(b.placed_at).getTime() - new Date(a.placed_at).getTime(),
      )
      .map((order) => {
        const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0)
        const primaryName = order.items[0]?.name ?? 'Order'
        const productName =
          order.items.length > 1
            ? `${primaryName} +${order.items.length - 1} more`
            : primaryName
        const hasItems = order.items.length > 0
        const allRaw =
          hasItems &&
          order.items.every(
            (item) =>
              (ingredientNameToType.get(item.name.trim().toLowerCase()) ?? 'NON_RAW') ===
              'RAW',
          )
        const deductions = buildInventoryDeductions(order, recipes, ingredients).map(
          (deduction) => {
            const ingredient = ingredientById.get(deduction.ingredientId)
            return {
              ingredientId: deduction.ingredientId,
              ingredientName: ingredient?.name ?? 'Unknown ingredient',
              qty: deduction.qty,
              unit: ingredient?.baseUnit ?? '',
            }
          },
        )
        return {
          id: `existing-${order.id}`,
          orderNo: order.order_no,
          status: order.status,
          productId: order.id,
          productName,
          productType: allRaw ? 'raw' : 'non_raw',
          quantity: itemCount,
          totalPrice: order.total,
          timestamp: order.placed_at,
          deductions,
        }
      })
  }, [existingOrders, ingredientNameToType, ingredientById, ingredients, recipes])

  return (
    <div className="page admin-page">
      <div className="page-header">
        <div>
          <h2>Order Deductions Dashboard</h2>
          <p className="muted">Review existing orders and ingredient deductions.</p>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '20px',
          padding: '20px',
        }}
      >
        <OrderHistoryPanel
          orders={existingOrderHistory}
          isEmpty={existingOrderHistory.length === 0}
        />
      </div>
    </div>
  )
}
