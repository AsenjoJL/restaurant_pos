import { useCallback, useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../app/store/hooks'
import { DATA_MODE } from '../../../app/config/data-mode'
import { getLiveSyncPollingOptions } from '../../../app/config/live-sync'
import { selectAdminSettings } from '../../admin/admin.selectors'
import Input from '../../../shared/components/ui/Input'
import Select from '../../../shared/components/ui/Select'
import Button from '../../../shared/components/ui/Button'
import Modal from '../../../shared/components/ui/Modal'
import { useLiveSyncPolling } from '../../../shared/hooks/useLiveSyncPolling'
import { formatCurrency } from '../../../shared/lib/format'
import { triggerPrint as triggerNativePrint } from '../../../shared/lib/print'
import { pushToast } from '../../../shared/store/ui.store'
import { selectSalesRecords } from '../sales.selectors'
import AdminStatCard from '../../admin/components/AdminStatCard'
import type { PaymentMethod, Order, OrderStatus } from '../../../shared/types/order'
import type { SalesRecord } from '../../../shared/types/sales'
import { hydrateSalesFromRepository } from '../sales.store'
import { selectOrders } from '../../orders/orders.selectors'
import { cancelOrder, syncOrderCancellation } from '../../orders/orders.store'
import OrderReceiptSheet from '../../../shared/components/receipt/OrderReceiptSheet'

type SalesUiStatus = 'PAID' | 'PENDING' | 'VOIDED' | 'CANCELLED'

const methodOptions = [
  { value: 'ALL', label: 'All methods' },
  { value: 'CASH', label: 'Cash' },
  { value: 'CARD', label: 'Card' },
  { value: 'GCASH', label: 'GCash' },
  { value: 'OTHER', label: 'Other' },
]

const statusOptions = [
  { value: 'ALL', label: 'All status' },
  { value: 'PAID', label: 'Paid' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'VOIDED', label: 'Voided' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

const toPrintableOrder = (
  record: SalesRecord,
  status: OrderStatus,
): Order => ({
  id: record.orderId,
  order_no: record.orderNo,
  source: record.source,
  status,
  order_type: record.orderType,
  table: null,
  items: record.items,
  note: undefined,
  subtotal: record.subtotal,
  discount: record.discount ?? 0,
  service_charge: record.serviceCharge ?? 0,
  tax: record.tax,
  total: record.total,
  payment_method: record.paymentMethod,
  payment_amount: record.paymentAmount,
  payment_change: record.paymentChange,
  payment_reference: record.paymentReference,
  payment_payer: record.paymentPayer,
  processed_by: record.processedBy,
  placed_at: record.placedAt,
  audit_log: [],
})

function AdminSalesPage() {
  const dispatch = useAppDispatch()
  const records = useAppSelector(selectSalesRecords)
  const settings = useAppSelector(selectAdminSettings)
  const orders = useAppSelector(selectOrders)
  const [query, setQuery] = useState('')
  const [methodFilter, setMethodFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null)
  const [printOrderId, setPrintOrderId] = useState<string | null>(null)

  const syncSales = useCallback(() => {
    void dispatch(hydrateSalesFromRepository())
  }, [dispatch])

  useLiveSyncPolling({
    enabled: DATA_MODE === 'api',
    sync: syncSales,
    ...getLiveSyncPollingOptions('salesRecords', settings.liveSync),
  })

  const orderById = useMemo(() => {
    const map = new Map<string, Order>()
    orders.forEach((order) => map.set(order.id, order))
    return map
  }, [orders])

  const getUiStatus = useCallback(
    (orderId: string): SalesUiStatus => {
      const order = orderById.get(orderId)
      if (!order) {
        return 'PAID'
      }
      if (order.status === 'CANCELLED') {
        return 'CANCELLED'
      }
      if (order.status === 'PENDING_PAYMENT' || order.status === 'HOLD') {
        return 'PENDING'
      }
      if (order.audit_log.some((entry) => entry.action === 'VOID')) {
        return 'VOIDED'
      }
      return 'PAID'
    },
    [orderById],
  )

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
      const uiStatus = getUiStatus(record.orderId)
      if (methodFilter !== 'ALL' && record.paymentMethod !== methodFilter) {
        return false
      }
      if (statusFilter !== 'ALL' && uiStatus !== statusFilter) {
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
  }, [endDate, getUiStatus, methodFilter, query, records, startDate, statusFilter])

  const sorted = useMemo(
    () =>
      [...filtered].sort(
        (a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime(),
      ),
    [filtered],
  )

  const metrics = useMemo(() => {
    const totalsByMethod: Record<PaymentMethod, number> = {
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
      cogs += record.cogs ?? 0
    })

    const totalOrders = filtered.length
    const avgTicket = totalOrders > 0 ? total / totalOrders : 0
    const profit = total - cogs

    return {
      totalSales: total,
      totalOrders,
      profit,
      avgTicket,
      totalsByMethod,
    }
  }, [filtered])

  const selectedRecord = useMemo(
    () => sorted.find((record) => record.id === selectedRecordId) ?? null,
    [selectedRecordId, sorted],
  )

  const printRecord = useMemo(
    () => sorted.find((record) => record.id === printOrderId) ?? null,
    [printOrderId, sorted],
  )

  const printOrder = useMemo(() => {
    if (!printRecord) {
      return null
    }
    const order = orderById.get(printRecord.orderId)
    return order ?? toPrintableOrder(printRecord, 'PAID')
  }, [orderById, printRecord])

  const handleExport = () => {
    const headers = [
      'Order ID',
      'Date & Time',
      'Cashier',
      'Payment Method',
      'Total',
      'COGS',
      'Profit',
      'Status',
    ]
    const rows = sorted.map((record) => [
      record.orderNo,
      new Date(record.paidAt).toISOString(),
      record.processedBy?.name ?? '',
      record.paymentMethod,
      record.total.toFixed(2),
      (record.cogs ?? 0).toFixed(2),
      (record.grossProfit ?? record.total - (record.cogs ?? 0)).toFixed(2),
      getUiStatus(record.orderId),
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

  const handlePrint = async (recordId: string) => {
    setPrintOrderId(recordId)
    requestAnimationFrame(() => {
      void triggerNativePrint({ silent: true })
    })
  }

  const handleVoid = (orderId: string) => {
    const order = orderById.get(orderId)
    if (!order) {
      dispatch(
        pushToast({
          title: 'Order not found',
          description: 'This sale is already archived and cannot be voided here.',
          variant: 'warning',
        }),
      )
      return
    }

    if (order.status !== 'PENDING_PAYMENT' && order.status !== 'HOLD') {
      dispatch(
        pushToast({
          title: 'Void blocked',
          description: 'Only pending or on-hold orders can be voided.',
          variant: 'warning',
        }),
      )
      return
    }

    const reason = 'Voided from sales records'
    dispatch(cancelOrder({ id: order.id, reason }))
    void dispatch(syncOrderCancellation({ id: order.id, reason }))
    dispatch(
      pushToast({
        title: 'Order voided',
        description: `${order.order_no} was cancelled.`,
        variant: 'success',
      }),
    )
  }

  return (
    <div className="page admin-page">
      <div className="page-header">
        <div>
          <h2>Sales Records</h2>
          <p className="muted">Track payments, profit, and cashier performance.</p>
        </div>
      </div>

      <div className="admin-toolbar admin-toolbar-surface sales-filter-bar">
        <Input
          label="Search"
          placeholder="Order ID or cashier"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          name="salesSearch"
        />
        <Select
          label="Payment Method"
          value={methodFilter}
          options={methodOptions}
          onChange={(event) => setMethodFilter(event.target.value)}
        />
        <Select
          label="Status"
          value={statusFilter}
          options={statusOptions}
          onChange={(event) => setStatusFilter(event.target.value)}
        />
        <Input
          label="Date From"
          type="date"
          value={startDate}
          onChange={(event) => setStartDate(event.target.value)}
          name="salesStartDate"
        />
        <Input
          label="Date To"
          type="date"
          value={endDate}
          onChange={(event) => setEndDate(event.target.value)}
          name="salesEndDate"
        />
        <Button variant="outline" onClick={handleExport} icon="download">
          Export
        </Button>
      </div>

      <div className="admin-stats">
        <AdminStatCard label="Total Sales" value={formatCurrency(metrics.totalSales)} icon="monitoring" />
        <AdminStatCard label="Total Orders" value={String(metrics.totalOrders)} icon="receipt_long" />
        <AdminStatCard label="Profit" value={formatCurrency(metrics.profit)} icon="trending_up" />
        <AdminStatCard label="Average Ticket" value={formatCurrency(metrics.avgTicket)} icon="point_of_sale" />
        <div className="panel admin-stat-card sales-payment-breakdown">
          <span className="material-symbols-rounded stat-icon" aria-hidden="true">
            account_balance_wallet
          </span>
          <span className="muted">Payment Breakdown</span>
          <div className="sales-payment-lines">
            <p>Cash: <strong>{formatCurrency(metrics.totalsByMethod.CASH)}</strong></p>
            <p>GCash: <strong>{formatCurrency(metrics.totalsByMethod.GCASH)}</strong></p>
            <p>Card: <strong>{formatCurrency(metrics.totalsByMethod.CARD)}</strong></p>
          </div>
        </div>
      </div>

      <div className="panel admin-card">
        <div className="admin-table admin-table-sales-records">
          <div className="admin-table-head sales-records">
            <span>Order ID</span>
            <span>Date & Time</span>
            <span>Cashier</span>
            <span>Payment Method</span>
            <span>Total</span>
            <span>Tax</span>
            <span>COGS</span>
            <span>Profit</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          {sorted.length === 0 ? (
            <div className="empty-state">
              <h3>No sales found</h3>
              <p className="muted">Try adjusting your filters.</p>
            </div>
          ) : (
            sorted.map((record) => {
              const cogs = record.cogs ?? 0
              const profit = record.grossProfit ?? record.total - cogs
              const status = getUiStatus(record.orderId)

              return (
                <div
                  key={record.id}
                  className="admin-table-row sales-records"
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedRecordId(record.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      setSelectedRecordId(record.id)
                    }
                  }}
                >
                  <div className="admin-cell-title">
                    <strong>{record.orderNo}</strong>
                  </div>
                  <span>{new Date(record.paidAt).toLocaleString()}</span>
                  <span>{record.processedBy?.name ?? '—'}</span>
                  <span>{record.paymentMethod}</span>
                  <span className="admin-price">{formatCurrency(record.total)}</span>
                  <span className="admin-price">{formatCurrency(record.tax)}</span>
                  <span className="admin-price">{formatCurrency(cogs)}</span>
                  <span className="admin-price">{formatCurrency(profit)}</span>
                  <span className={`sales-status-pill sales-status-pill--${status.toLowerCase()}`}>
                    {status}
                  </span>
                  <div
                    className="admin-row-actions sales-row-actions"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <Button
                      variant="outline"
                      className="sales-action-btn sales-action-view"
                      onClick={() => setSelectedRecordId(record.id)}
                      icon="visibility"
                    >
                      View
                    </Button>
                    <Button
                      variant="outline"
                      className="sales-action-btn sales-action-print"
                      onClick={() => handlePrint(record.id)}
                      icon="print"
                    >
                      Print
                    </Button>
                    <Button
                      variant="outline"
                      className="sales-action-btn sales-action-void"
                      onClick={() => handleVoid(record.orderId)}
                      icon="cancel"
                    >
                      Void
                    </Button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      <Modal
        isOpen={Boolean(selectedRecord)}
        title="Order Details"
        onClose={() => setSelectedRecordId(null)}
        footer={
          <div className="modal-actions">
            <Button variant="ghost" onClick={() => setSelectedRecordId(null)}>
              Close
            </Button>
            {selectedRecord ? (
              <Button variant="outline" onClick={() => handlePrint(selectedRecord.id)} icon="print">
                Print
              </Button>
            ) : null}
          </div>
        }
      >
        {selectedRecord ? (
          <div className="sales-order-modal">
            <div className="sales-order-meta">
              <p><strong>Order:</strong> {selectedRecord.orderNo}</p>
              <p><strong>Cashier:</strong> {selectedRecord.processedBy?.name ?? '—'}</p>
              <p><strong>Paid At:</strong> {new Date(selectedRecord.paidAt).toLocaleString()}</p>
            </div>
            <div className="sales-order-items">
              {selectedRecord.items.map((item) => (
                <div key={`${selectedRecord.id}-${item.id}-${item.name}`} className="sales-order-item">
                  <div>
                    <strong>{item.name}</strong>
                    {item.modifiers && item.modifiers.length > 0 ? (
                      <p className="muted">{item.modifiers.join(', ')}</p>
                    ) : null}
                  </div>
                  <span>{item.quantity}</span>
                  <span>{formatCurrency(item.price)}</span>
                  <span>{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="sales-order-summary">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>{formatCurrency(selectedRecord.subtotal)}</span>
              </div>
              <div className="summary-row">
                <span>Tax</span>
                <span>{formatCurrency(selectedRecord.tax)}</span>
              </div>
              <div className="summary-row">
                <span>Discount</span>
                <span>{formatCurrency(selectedRecord.discount ?? 0)}</span>
              </div>
              <div className="summary-total">
                <span>Total</span>
                <span>{formatCurrency(selectedRecord.total)}</span>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>

      {printOrder ? (
        <OrderReceiptSheet order={printOrder} variant="receipt" />
      ) : null}
    </div>
  )
}

export default AdminSalesPage
