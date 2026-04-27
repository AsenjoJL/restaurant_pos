import type { Ingredient } from './inventory.types'
import {
  DATA_FILE_FORMAT_OPTIONS,
  downloadBlob,
  formatDateStamp,
  recordsToCsv,
  type DataFileFormat,
} from '../../shared/lib/exportFiles'
import {
  INVENTORY_IMPORT_HEADERS,
  INVENTORY_IMPORT_SAMPLE_ROWS,
} from './inventory.import'

export type InventoryFileFormat = DataFileFormat

export const INVENTORY_FILE_FORMAT_OPTIONS = DATA_FILE_FORMAT_OPTIONS

const INVENTORY_EXPORT_HEADERS = [
  'inventory id',
  'ingredient type',
  'name',
  'category',
  'base unit',
  'on hand',
  'reorder level',
  'unit cost',
  'status',
  'inventory value',
] as const

type InventoryExportRow = Record<(typeof INVENTORY_EXPORT_HEADERS)[number], string | number>
type InventoryTemplateRow = Record<(typeof INVENTORY_IMPORT_HEADERS)[number], string | number>

const writeWorkbook = async <T extends Record<string, string | number>>({
  filename,
  headers,
  rows,
  sheetName,
}: {
  filename: string
  headers: readonly (keyof T & string)[]
  rows: T[]
  sheetName: string
}) => {
  const XLSX = await import('xlsx')
  const worksheet = XLSX.utils.json_to_sheet(rows, { header: [...headers] })
  XLSX.utils.sheet_add_aoa(worksheet, [[...headers]], { origin: 'A1' })
  worksheet['!cols'] = headers.map((header) => ({
    wch: Math.max(14, header.length + 4),
  }))
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
  XLSX.writeFile(workbook, filename)
}

export const buildInventoryExportRows = (ingredients: Ingredient[]): InventoryExportRow[] =>
  ingredients.map((ingredient) => {
    const unitCost = ingredient.unitCost ?? 0
    const isLow = ingredient.onHand <= ingredient.reorderLevel
    return {
      'inventory id': ingredient.inventoryId ?? '',
      'ingredient type': ingredient.ingredientType ?? 'RAW',
      name: ingredient.name,
      category: ingredient.category,
      'base unit': ingredient.baseUnit,
      'on hand': ingredient.onHand,
      'reorder level': ingredient.reorderLevel,
      'unit cost': unitCost,
      status: isLow ? 'LOW_STOCK' : 'OK',
      'inventory value': ingredient.onHand * unitCost,
    }
  })

export const buildInventoryTemplateRows = (): InventoryTemplateRow[] => [
  ...INVENTORY_IMPORT_SAMPLE_ROWS,
]

export const downloadInventoryExport = async ({
  format,
  ingredients,
}: {
  format: InventoryFileFormat
  ingredients: Ingredient[]
}) => {
  const rows = buildInventoryExportRows(ingredients)
  const dateStamp = formatDateStamp()

  if (format === 'xlsx') {
    await writeWorkbook({
      filename: `inventory-export-${dateStamp}.xlsx`,
      headers: INVENTORY_EXPORT_HEADERS,
      rows,
      sheetName: 'Inventory',
    })
    return
  }

  if (format === 'json') {
    downloadBlob(
      `${JSON.stringify({ exportedAt: new Date().toISOString(), ingredients: rows }, null, 2)}\n`,
      'application/json;charset=utf-8',
      `inventory-export-${dateStamp}.json`,
    )
    return
  }

  downloadBlob(
    recordsToCsv(rows, INVENTORY_EXPORT_HEADERS),
    'text/csv;charset=utf-8',
    `inventory-export-${dateStamp}.csv`,
  )
}

export const downloadInventoryTemplate = async (format: InventoryFileFormat) => {
  const rows = buildInventoryTemplateRows()

  if (format === 'xlsx') {
    await writeWorkbook({
      filename: 'inventory-import-template.xlsx',
      headers: INVENTORY_IMPORT_HEADERS,
      rows,
      sheetName: 'Ingredients',
    })
    return
  }

  if (format === 'json') {
    downloadBlob(
      `${JSON.stringify({ template: 'inventory-import', rows }, null, 2)}\n`,
      'application/json;charset=utf-8',
      'inventory-import-template.json',
    )
    return
  }

  downloadBlob(
    recordsToCsv(rows, INVENTORY_IMPORT_HEADERS),
    'text/csv;charset=utf-8',
    'inventory-import-template.csv',
  )
}
