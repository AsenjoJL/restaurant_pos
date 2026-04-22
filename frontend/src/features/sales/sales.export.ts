import type { WorkBook, WorkSheet } from 'xlsx'
import type { SalesRecord } from '../../shared/types/sales'
import type { SalesUiStatus } from './useAdminSalesModel'

const SALES_EXPORT_CURRENCY_FORMAT = '"₱"#,##0.00'
const SALES_EXPORT_DATE_TIME_FORMAT = 'mmm d, yyyy h:mm AM/PM'
const SALES_EXPORT_SHEET_NAME = 'Sales Records'
const SALES_EXPORT_TITLE = 'Sales Records Export'

type SalesExportColumn = {
  header: string
  width: number
  value: (record: SalesRecord, getUiStatus: (orderId: string) => SalesUiStatus) => string | number | Date
  format?: 'currency' | 'date'
}

export type SalesExportSummary = {
  totalSales: number
  totalOrders: number
  totalProfit: number
  averageTicket: number
}

type BuildSalesExportWorkbookInput = {
  records: SalesRecord[]
  getUiStatus: (orderId: string) => SalesUiStatus
  summary: SalesExportSummary
  includeSummary?: boolean
}

const SALES_EXPORT_COLUMNS: SalesExportColumn[] = [
  {
    header: 'Order ID',
    width: 16,
    value: (record) => record.orderNo,
  },
  {
    header: 'Date & Time',
    width: 24,
    value: (record) => new Date(record.paidAt),
    format: 'date',
  },
  {
    header: 'Cashier',
    width: 22,
    value: (record) => record.processedBy?.name ?? '',
  },
  {
    header: 'Payment Method',
    width: 18,
    value: (record) => record.paymentMethod,
  },
  {
    header: 'Total',
    width: 16,
    value: (record) => record.total,
    format: 'currency',
  },
  {
    header: 'COGS',
    width: 14,
    value: (record) => record.cogs ?? 0,
    format: 'currency',
  },
  {
    header: 'Profit',
    width: 16,
    value: (record) => record.grossProfit ?? record.total - (record.cogs ?? 0),
    format: 'currency',
  },
  {
    header: 'Status',
    width: 14,
    value: (record, getUiStatus) => getUiStatus(record.orderId),
  },
]

const SALES_EXPORT_SUMMARY_FIELDS: Array<{
  label: string
  value: (summary: SalesExportSummary) => string | number
  format?: 'currency'
}> = [
  { label: 'Total Sales', value: (summary) => summary.totalSales, format: 'currency' },
  { label: 'Total Orders', value: (summary) => summary.totalOrders },
  { label: 'Total Profit', value: (summary) => summary.totalProfit, format: 'currency' },
  { label: 'Average Ticket', value: (summary) => summary.averageTicket, format: 'currency' },
]

const setCurrencyCell = (sheet: WorkSheet, address: string) => {
  const cell = sheet[address]
  if (!cell) {
    return
  }
  cell.t = 'n'
  cell.z = SALES_EXPORT_CURRENCY_FORMAT
}

const setDateCell = (sheet: WorkSheet, address: string) => {
  const cell = sheet[address]
  if (!cell) {
    return
  }
  cell.z = SALES_EXPORT_DATE_TIME_FORMAT
}

const applyFormat = (
  sheet: WorkSheet,
  address: string,
  format: SalesExportColumn['format'] | 'currency' | undefined,
) => {
  if (format === 'currency') {
    setCurrencyCell(sheet, address)
    return
  }
  if (format === 'date') {
    setDateCell(sheet, address)
  }
}

const getExcelColumnLabel = (index: number) => {
  let current = index + 1
  let label = ''
  while (current > 0) {
    const remainder = (current - 1) % 26
    label = String.fromCharCode(65 + remainder) + label
    current = Math.floor((current - 1) / 26)
  }
  return label
}

const buildSummaryRows = (summary: SalesExportSummary) =>
  SALES_EXPORT_SUMMARY_FIELDS.map((field) => [field.label, field.value(summary)])

export async function buildSalesExportWorkbook({
  records,
  getUiStatus,
  summary,
  includeSummary = true,
}: BuildSalesExportWorkbookInput): Promise<WorkBook> {
  const XLSX = await import('xlsx')
  const headerRow = SALES_EXPORT_COLUMNS.map((column) => column.header)

  const worksheetRows: Array<Array<string | number | Date>> = [
    [SALES_EXPORT_TITLE],
  ]

  if (includeSummary) {
    worksheetRows.push([])
    worksheetRows.push(['Summary'])
    worksheetRows.push(...buildSummaryRows(summary))
    worksheetRows.push([])
  }

  const tableHeaderRowIndex = worksheetRows.length + 1

  worksheetRows.push(headerRow)

  records.forEach((record) => {
    worksheetRows.push(SALES_EXPORT_COLUMNS.map((column) => column.value(record, getUiStatus)))
  })

  const sheet = XLSX.utils.aoa_to_sheet(worksheetRows)
  const workbook = XLSX.utils.book_new()

  sheet['!cols'] = SALES_EXPORT_COLUMNS.map((column) => ({ wch: column.width }))

  sheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: SALES_EXPORT_COLUMNS.length - 1 } }]

  if (includeSummary) {
    SALES_EXPORT_SUMMARY_FIELDS.forEach((field, index) => {
      const rowNumber = 4 + index
      applyFormat(sheet, `B${rowNumber}`, field.format)
    })
  }

  const firstDataRowIndex = tableHeaderRowIndex + 1
  const lastDataRowIndex = tableHeaderRowIndex + records.length

  for (let rowIndex = firstDataRowIndex; rowIndex <= lastDataRowIndex; rowIndex += 1) {
    SALES_EXPORT_COLUMNS.forEach((column, columnIndex) => {
      applyFormat(sheet, `${getExcelColumnLabel(columnIndex)}${rowIndex}`, column.format)
    })
  }

  sheet['!autofilter'] = {
    ref: `A${tableHeaderRowIndex}:${getExcelColumnLabel(SALES_EXPORT_COLUMNS.length - 1)}${Math.max(tableHeaderRowIndex, lastDataRowIndex)}`,
  }

  XLSX.utils.book_append_sheet(workbook, sheet, SALES_EXPORT_SHEET_NAME)

  return workbook
}
