export type CsvCellValue = string | number
export type CsvRow = CsvCellValue[]
export type DataFileFormat = 'xlsx' | 'csv' | 'json'

export const DATA_FILE_FORMAT_OPTIONS: Array<{
  value: DataFileFormat
  label: string
}> = [
  { value: 'xlsx', label: 'Excel (.xlsx)' },
  { value: 'csv', label: 'CSV (.csv)' },
  { value: 'json', label: 'JSON (.json)' },
]

export const DATA_FILE_ACCEPT: Record<DataFileFormat, string> = {
  xlsx: '.xlsx,.xls',
  csv: '.csv',
  json: '.json',
}

export const formatDateStamp = () => new Date().toISOString().slice(0, 10)

export const downloadBlob = (content: BlobPart, type: string, filename: string) => {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.style.display = 'none'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

export const escapeCsvCell = (value: CsvCellValue) => {
  const text = String(value)
  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

export const rowsToCsv = (rows: CsvRow[]) =>
  `\uFEFF${rows.map((row) => row.map(escapeCsvCell).join(',')).join('\r\n')}`

export const recordsToCsv = <TRecord extends Record<string, CsvCellValue>>(
  records: TRecord[],
  headers: readonly (keyof TRecord & string)[],
) => {
  const rows: CsvRow[] = [
    [...headers],
    ...records.map((record) => headers.map((header) => record[header] ?? '')),
  ]
  return rowsToCsv(rows)
}

export const normalizeExportValue = (value: string | number | Date): CsvCellValue => {
  if (value instanceof Date) {
    return value.toISOString()
  }
  return value
}
