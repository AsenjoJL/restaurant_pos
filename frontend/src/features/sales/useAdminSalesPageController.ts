import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../app/store/hooks'
import { useScheduledPrint } from '../../shared/hooks/useScheduledPrint'
import { pushToast } from '../../shared/store/ui.store'
import type { Order, OrderStatus } from '../../shared/types/order'
import type { SalesRecord } from '../../shared/types/sales'
import { SALES_METHOD_OPTIONS, SALES_STATUS_OPTIONS } from '../admin/admin.sales-center'
import { selectOrders } from '../orders/orders.selectors'
import { buildSalesExportWorkbook } from './sales.export'
import { selectSalesRecords } from './sales.selectors'
import { useAdminSalesModel } from './useAdminSalesModel'

const toPrintableOrder = (record: SalesRecord, status: OrderStatus): Order => ({
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

const getSalesExportSummary = (metrics: {
  totalSales: number
  totalOrders: number
  profit: number
  avgTicket: number
}) => ({
  totalSales: metrics.totalSales,
  totalOrders: metrics.totalOrders,
  totalProfit: metrics.profit,
  averageTicket: metrics.avgTicket,
})

function useAdminSalesPageController() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const records = useAppSelector(selectSalesRecords)
  const orders = useAppSelector(selectOrders)
  const [query, setQuery] = useState('')
  const [methodFilter, setMethodFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null)
  const { printId: printOrderId, schedulePrint } = useScheduledPrint({
    startDelayMs: 0,
    clearDelayMs: 900,
  })

  const model = useAdminSalesModel({
    records,
    orders,
    filters: {
      query,
      methodFilter,
      statusFilter,
      startDate,
      endDate,
    },
  })

  const selectedRecord = useMemo(
    () => model.sorted.find((record) => record.id === selectedRecordId) ?? null,
    [model.sorted, selectedRecordId],
  )
  const printRecord = useMemo(
    () => model.sorted.find((record) => record.id === printOrderId) ?? null,
    [model.sorted, printOrderId],
  )
  const printOrder = useMemo(() => {
    if (!printRecord) {
      return null
    }
    const order = model.orderById.get(printRecord.orderId)
    return order ?? toPrintableOrder(printRecord, 'PAID')
  }, [model.orderById, printRecord])

  const handleExport = async () => {
    try {
      const workbook = await buildSalesExportWorkbook({
        records: model.sorted,
        getUiStatus: model.getUiStatus,
        summary: getSalesExportSummary(model.metrics),
        includeSummary: true,
      })

      const XLSX = await import('xlsx')
      XLSX.writeFile(workbook, `sales-records-${new Date().toISOString().slice(0, 10)}.xlsx`)
    } catch {
      dispatch(
        pushToast({
          title: 'Export failed',
          description: 'Could not generate the Excel file. Please try again.',
          variant: 'error',
        }),
      )
    }
  }

  return {
    endDate,
    methodFilter,
    methodOptions: SALES_METHOD_OPTIONS,
    model,
    printOrder,
    query,
    selectedRecord,
    startDate,
    statusFilter,
    statusOptions: SALES_STATUS_OPTIONS,
    handleBackToSales: () => navigate('/admin/sales-center'),
    handleEndDateChange: setEndDate,
    handleExport,
    handleMethodFilterChange: setMethodFilter,
    handlePrint: (recordId: string) => schedulePrint(recordId),
    handleQueryChange: setQuery,
    handleSelectRecord: setSelectedRecordId,
    handleStartDateChange: setStartDate,
    handleStatusFilterChange: setStatusFilter,
    handleCloseDetails: () => setSelectedRecordId(null),
  }
}

export default useAdminSalesPageController
