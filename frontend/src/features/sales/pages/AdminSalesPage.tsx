import { useMemo, useState } from 'react'
import { useAppSelector } from '../../../app/store/hooks'
import Input from '../../../shared/components/ui/Input'
import Select from '../../../shared/components/ui/Select'
import Button from '../../../shared/components/ui/Button'
import { formatCurrency } from '../../../shared/lib/format'
import { selectSalesRecords } from '../sales.selectors'
import type { PaymentMethod } from '../../../shared/types/order'
import { categories, products } from '../../../mock/data'

const methodOptions = [
  { value: 'ALL', label: 'All methods' },
  { value: 'CASH', label: 'Cash' },
  { value: 'CARD', label: 'Card' },
  { value: 'GCASH', label: 'GCash' },
  { value: 'OTHER', label: 'Other' },
]

function AdminSalesPage() {
  const records = useAppSelector(selectSalesRecords)
  const [query, setQuery] = useState('')
  const [methodFilter, setMethodFilter] = useState('ALL')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const toLocalDayStart = (value: string) => {
    const date = new Date(`${value}T00:00:00`)
    return Number.isNaN(date.getTime()) ? null : date
  }

  const toLocalDayEnd = (value: string) => {
    const date = new Date(`${value}T23:59:59`)
    return Number.isNaN(date.getTime()) ? null : date
  }

  const filtered = useMemo(() => {
    const trimmed = query.trim().toLowerCase()
    const start = startDate ? toLocalDayStart(startDate) : null
    const end = endDate ? toLocalDayEnd(endDate) : null
    return records.filter((record) => {
      if (methodFilter !== 'ALL' && record.paymentMethod !== methodFilter) {
        return false
      }
      if (start || end) {
        const paidAt = new Date(record.paidAt)
        if (start && paidAt < start) {
          return false
        }
        if (end && paidAt > end) {
          return false
        }
      }
      if (!trimmed) {
        return true
      }
      return (
        record.orderNo.toLowerCase().includes(trimmed) ||
        record.processedBy?.name.toLowerCase().includes(trimmed)
      )
    })
  }, [methodFilter, query, records])

  const metrics = useMemo(() => {
    const totalsByMethod: Record<PaymentMethod, number> = {
      CASH: 0,
      CARD: 0,
      GCASH: 0,
      OTHER: 0,
    }
    const countByMethod: Record<PaymentMethod, number> = {
      CASH: 0,
      CARD: 0,
      GCASH: 0,
      OTHER: 0,
    }
    let total = 0
    let cogs = 0
    filtered.forEach((record) => {
      total += record.total
      totalsByMethod[record.paymentMethod] += record.total
      countByMethod[record.paymentMethod] += 1
      cogs += record.cogs ?? 0
    })
    const avgTicket = filtered.length > 0 ? total / filtered.length : 0
    const grossProfit = total - cogs
    const grossMargin = total > 0 ? grossProfit / total : 0
    return {
      total,
      avgTicket,
      totalsByMethod,
      countByMethod,
      cogs,
      grossProfit,
      grossMargin,
    }
  }, [filtered])

  const dailySummary = useMemo(() => {
    const byDay = new Map<string, { total: number; count: number }>()
    filtered.forEach((record) => {
      const day = new Date(record.paidAt).toLocaleDateString()
      const entry = byDay.get(day) ?? { total: 0, count: 0 }
      entry.total += record.total
      entry.count += 1
      byDay.set(day, entry)
    })
    return Array.from(byDay.entries())
      .map(([day, data]) => ({ day, ...data }))
      .sort((a, b) => new Date(a.day).getTime() - new Date(b.day).getTime())
      .slice(-7)
  }, [filtered])

  const categoryAllocation = useMemo(() => {
    const categoryById = new Map(categories.map((category) => [category.id, category.name]))
    const productCategory = new Map(products.map((product) => [product.id, product.categoryId]))
    const totals = new Map<string, { revenue: number; qty: number }>()

    filtered.forEach((record) => {
      record.items.forEach((item) => {
        if (item.bundle_items && item.bundle_items.length > 0) {
          item.bundle_items.forEach((bundleItem) => {
            const categoryId = productCategory.get(bundleItem.id) ?? 'uncategorized'
            const name = categoryById.get(categoryId) ?? 'Uncategorized'
            const entry = totals.get(name) ?? { revenue: 0, qty: 0 }
            entry.revenue += bundleItem.price * bundleItem.quantity
            entry.qty += bundleItem.quantity
            totals.set(name, entry)
          })
          return
        }

        const categoryId = productCategory.get(item.id) ?? 'uncategorized'
        const name = categoryById.get(categoryId) ?? 'Uncategorized'
        const entry = totals.get(name) ?? { revenue: 0, qty: 0 }
        entry.revenue += item.price * item.quantity
        entry.qty += item.quantity
        totals.set(name, entry)
      })
    })

    return Array.from(totals.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
  }, [filtered])

  const topItems = useMemo(() => {
    const counts = new Map<string, number>()
    filtered.forEach((record) => {
      record.items.forEach((item) => {
        const current = counts.get(item.name) ?? 0
        counts.set(item.name, current + item.quantity)
      })
    })
    return Array.from(counts.entries())
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 8)
  }, [filtered])

  const sorted = useMemo(
    () =>
      [...filtered].sort(
        (a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime(),
      ),
    [filtered],
  )

  const handleExport = () => {
    const headers = [
      'Order No',
      'Paid At',
      'Payment Method',
      'Subtotal',
      'Tax',
      'Total',
      'COGS',
      'Gross Profit',
      'Gross Margin',
      'Processed By',
      'Order Type',
      'Source',
    ]
    const rows = sorted.map((record) => [
      record.orderNo,
      new Date(record.paidAt).toISOString(),
      record.paymentMethod,
      record.subtotal.toFixed(2),
      record.tax.toFixed(2),
      record.total.toFixed(2),
      (record.cogs ?? 0).toFixed(2),
      (record.grossProfit ?? record.total - (record.cogs ?? 0)).toFixed(2),
      `${Math.round((record.grossMargin ?? 0) * 100)}%`,
      record.processedBy?.name ?? '',
      record.orderType,
      record.source,
    ])
    const csv = [headers, ...rows]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `sales-records-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="page admin-page">
      <div className="page-header">
        <div>
          <h2>Sales Records</h2>
          <p className="muted">Paid orders captured from cashier and kiosk.</p>
        </div>
      </div>

      <div className="admin-toolbar admin-toolbar-surface">
        <Input
          label="Search order or cashier"
          placeholder="Search by order number or staff"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          name="salesSearch"
        />
        <Select
          label="Payment method"
          value={methodFilter}
          options={methodOptions}
          onChange={(event) => setMethodFilter(event.target.value)}
        />
        <Input
          label="Start date"
          type="date"
          value={startDate}
          onChange={(event) => setStartDate(event.target.value)}
          name="salesStartDate"
        />
        <Input
          label="End date"
          type="date"
          value={endDate}
          onChange={(event) => setEndDate(event.target.value)}
          name="salesEndDate"
        />
        <Button variant="outline" onClick={handleExport} icon="download">
          Export CSV
        </Button>
      </div>

      <div className="admin-stats">
        <div className="admin-stat-card panel">
          <span className="muted">Total Sales</span>
          <h3>{formatCurrency(metrics.total)}</h3>
          <p className="muted">{filtered.length} records</p>
        </div>
        <div className="admin-stat-card panel">
          <span className="muted">COGS</span>
          <h3>{formatCurrency(metrics.cogs)}</h3>
          <p className="muted">Ingredient cost</p>
        </div>
        <div className="admin-stat-card panel">
          <span className="muted">Gross Profit</span>
          <h3>{formatCurrency(metrics.grossProfit)}</h3>
          <p className="muted">{Math.round(metrics.grossMargin * 100)}% margin</p>
        </div>
        <div className="admin-stat-card panel">
          <span className="muted">Average Ticket</span>
          <h3>{formatCurrency(metrics.avgTicket)}</h3>
          <p className="muted">Per paid order</p>
        </div>
        <div className="admin-stat-card panel">
          <span className="muted">Cash</span>
          <h3>{formatCurrency(metrics.totalsByMethod.CASH)}</h3>
          <p className="muted">{metrics.countByMethod.CASH} orders</p>
        </div>
        <div className="admin-stat-card panel">
          <span className="muted">Card</span>
          <h3>{formatCurrency(metrics.totalsByMethod.CARD)}</h3>
          <p className="muted">{metrics.countByMethod.CARD} orders</p>
        </div>
        <div className="admin-stat-card panel">
          <span className="muted">GCash</span>
          <h3>{formatCurrency(metrics.totalsByMethod.GCASH)}</h3>
          <p className="muted">{metrics.countByMethod.GCASH} orders</p>
        </div>
        <div className="admin-stat-card panel">
          <span className="muted">Other</span>
          <h3>{formatCurrency(metrics.totalsByMethod.OTHER)}</h3>
          <p className="muted">{metrics.countByMethod.OTHER} orders</p>
        </div>
      </div>

      <div className="admin-grid admin-analytics-grid">
        <div className="panel admin-card">
          <div className="admin-card-header">
            <h3>Daily Summary</h3>
            <span className="muted">Last {dailySummary.length} days</span>
          </div>
          <ul className="admin-list">
            {dailySummary.length > 0 ? (
              dailySummary.map((day) => (
                <li key={day.day}>
                  <span>{day.day}</span>
                  <strong>
                    {formatCurrency(day.total)} · {day.count} orders
                  </strong>
                </li>
              ))
            ) : (
              <li>
                <span>No data</span>
                <span className="muted">Add paid orders</span>
              </li>
            )}
          </ul>
        </div>

        <div className="panel admin-card">
          <div className="admin-card-header">
            <h3>Top Items Sold</h3>
            <span className="muted">{topItems.length} items</span>
          </div>
          <ul className="admin-list">
            {topItems.length > 0 ? (
              topItems.map((item) => (
                <li key={item.name}>
                  <span>{item.name}</span>
                  <strong>{item.qty}</strong>
                </li>
              ))
            ) : (
              <li>
                <span>No sales yet</span>
                <span className="muted">Waiting on payments</span>
              </li>
            )}
          </ul>
        </div>

        <div className="panel admin-card">
          <div className="admin-card-header">
            <h3>Category Allocation</h3>
            <span className="muted">{categoryAllocation.length} categories</span>
          </div>
          <ul className="admin-list">
            {categoryAllocation.length > 0 ? (
              categoryAllocation.map((category) => (
                <li key={category.name}>
                  <span>{category.name}</span>
                  <strong>
                    {formatCurrency(category.revenue)} · {category.qty} items
                  </strong>
                </li>
              ))
            ) : (
              <li>
                <span>No allocation data</span>
                <span className="muted">Waiting on sales</span>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="admin-table">
        <div className="admin-table-head sales">
          <span>Order</span>
          <span>Paid At</span>
          <span>Method</span>
          <span>Subtotal</span>
          <span>Tax</span>
          <span>Total</span>
          <span>COGS</span>
          <span>Profit</span>
          <span>Margin</span>
          <span>Processed By</span>
        </div>
        {sorted.length === 0 ? (
          <div className="panel empty-state">
            <h3>No sales yet</h3>
            <p className="muted">Captured payments will appear here.</p>
          </div>
        ) : (
          sorted.map((record) => (
            <div key={record.id} className="admin-table-row sales">
              {(() => {
                const cogs = record.cogs ?? 0
                const grossProfit = record.grossProfit ?? record.total - cogs
                const grossMargin =
                  record.grossMargin ?? (record.total > 0 ? grossProfit / record.total : 0)
                return (
                  <>
              <div className="admin-cell-title">
                <strong>{record.orderNo}</strong>
                <span className="muted">{record.source}</span>
              </div>
              <span>{new Date(record.paidAt).toLocaleString()}</span>
              <span>{record.paymentMethod}</span>
              <span className="admin-price">{formatCurrency(record.subtotal)}</span>
              <span className="admin-price">{formatCurrency(record.tax)}</span>
              <span className="admin-price">{formatCurrency(record.total)}</span>
              <span className="admin-price">{formatCurrency(cogs)}</span>
              <span className="admin-price">{formatCurrency(grossProfit)}</span>
              <span className="admin-count">{Math.round(grossMargin * 100)}%</span>
              <span>{record.processedBy?.name ?? '—'}</span>
                  </>
                )
              })()}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default AdminSalesPage
