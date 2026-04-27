import type { Ingredient, IngredientBaseUnit } from './inventory.types'

type ImportRow = Record<string, unknown>

type ParsedIngredientImport =
  | { status: 'skip' }
  | { status: 'error' }
  | {
      status: 'ok'
      payload: Pick<
        Ingredient,
        | 'inventoryId'
        | 'ingredientType'
        | 'name'
        | 'category'
        | 'baseUnit'
        | 'onHand'
        | 'reorderLevel'
        | 'unitCost'
      >
    }

export const INVENTORY_IMPORT_HEADERS = [
  'inventory id',
  'ingredient type',
  'name',
  'category',
  'base unit',
  'on hand',
  'reorder level',
  'unit cost',
  'bulk qty',
  'bulk unit',
  'bulk price',
] as const

export const INVENTORY_IMPORT_SAMPLE = {
  'inventory id': 'ING-0001',
  'ingredient type': 'RAW',
  name: 'Chicken (raw)',
  category: 'Meat & Poultry',
  'base unit': 'g',
  'on hand': 10000,
  'reorder level': 2500,
  'unit cost': 0.05,
  'bulk qty': 20,
  'bulk unit': 'kg',
  'bulk price': 1000,
}

export const INVENTORY_IMPORT_SAMPLE_ROWS = [
  INVENTORY_IMPORT_SAMPLE,
  {
    'inventory id': 'ING-0002',
    'ingredient type': 'NON_RAW',
    name: 'Paper bag',
    category: 'Packaging & Service Items',
    'base unit': 'pcs',
    'on hand': 1000,
    'reorder level': 250,
    'unit cost': 1.5,
    'bulk qty': 100,
    'bulk unit': 'pcs',
    'bulk price': 150,
  },
] satisfies Array<Record<(typeof INVENTORY_IMPORT_HEADERS)[number], string | number>>

const normalizeHeader = (value: string) =>
  value.toLowerCase().replace(/[\s_-]+/g, '').trim()

const getRowValue = (row: ImportRow, keys: string[]) => {
  const map = new Map(
    Object.entries(row).map(([key, value]) => [normalizeHeader(key), value]),
  )
  for (const key of keys) {
    const value = map.get(normalizeHeader(key))
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return value
    }
  }
  return ''
}

const parseNumber = (value: unknown) => {
  if (typeof value === 'number') {
    return value
  }
  const cleaned = String(value).replace(/[^0-9.-]/g, '')
  if (!cleaned) {
    return Number.NaN
  }
  return Number(cleaned)
}

const normalizeIngredientType = (value: unknown) => {
  const normalized = String(value).toLowerCase().replace(/[\s_-]+/g, '').trim()
  if (!normalized) {
    return undefined
  }
  if (['nonraw', 'nonrawitem', 'finished', 'packaged', 'readytoeat'].includes(normalized)) {
    return 'NON_RAW' as const
  }
  if (['raw', 'rawitem', 'ingredient'].includes(normalized)) {
    return 'RAW' as const
  }
  return undefined
}

export const parseSheetRows = (
  XLSX: typeof import('xlsx'),
  sheet: import('xlsx').WorkSheet,
) => {
  const rows = XLSX.utils.sheet_to_json<(string | number)[]>(sheet, {
    header: 1,
    defval: '',
  })
  if (!Array.isArray(rows) || rows.length === 0) {
    return []
  }

  const findHeaderIndex = () => {
    for (let index = 0; index < Math.min(rows.length, 5); index += 1) {
      const headerRow = rows[index].map((cell) => String(cell))
      const headerMap = new Map(
        headerRow.map((cell, rowIndex) => [normalizeHeader(cell), rowIndex]),
      )
      const hasName =
        headerMap.has('name') ||
        headerMap.has('ingredient') ||
        headerMap.has('ingredientname')
      const hasCategory =
        headerMap.has('category') || headerMap.has('cat') || headerMap.has('type')
      const hasUnit =
        headerMap.has('baseunit') || headerMap.has('unit') || headerMap.has('uom')
      if (hasName && hasCategory && hasUnit) {
        return index
      }
    }
    return -1
  }

  const buildFromHeader = (headerRow: string[], startIndex: number) =>
    rows.slice(startIndex).map((row) => {
      const record: Record<string, unknown> = {}
      headerRow.forEach((cell, index) => {
        record[String(cell)] = row[index] ?? ''
      })
      return record
    })

  const buildFromPositions = () =>
    rows.map((row) => ({
      inventoryId: row[0] ?? '',
      ingredientType: row[1] ?? '',
      name: row[2] ?? '',
      category: row[3] ?? '',
      baseUnit: row[4] ?? '',
      onHand: row[5] ?? '',
      reorderLevel: row[6] ?? '',
      unitCost: row[7] ?? '',
      bulkQty: row[8] ?? '',
      bulkUnit: row[9] ?? '',
      bulkPrice: row[10] ?? '',
    }))

  const headerIndex = findHeaderIndex()
  if (headerIndex >= 0) {
    const headerRow = rows[headerIndex].map((cell) => String(cell))
    return buildFromHeader(headerRow, headerIndex + 1)
  }

  return buildFromPositions()
}

const getJsonRows = (value: unknown): Record<string, unknown>[] => {
  if (Array.isArray(value)) {
    return value.filter((row): row is Record<string, unknown> =>
      typeof row === 'object' && row !== null && !Array.isArray(row),
    )
  }

  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return []
  }

  const record = value as Record<string, unknown>
  const candidateRows = record.ingredients ?? record.rows ?? record.data
  return getJsonRows(candidateRows)
}

const getFileExtension = (filename: string) =>
  filename.split('.').pop()?.trim().toLowerCase() ?? ''

export const parseInventoryImportFile = async (file: File) => {
  const extension = getFileExtension(file.name)

  if (extension === 'json') {
    return getJsonRows(JSON.parse(await file.text()))
  }

  const XLSX = await import('xlsx')

  if (extension === 'csv' || extension === 'tsv') {
    const workbook = XLSX.read(await file.text(), { type: 'string' })
    const sheetName = workbook.SheetNames[0]
    if (!sheetName) {
      throw new Error('Missing worksheet')
    }
    return parseSheetRows(XLSX, workbook.Sheets[sheetName])
  }

  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array' })
  const sheetName = workbook.SheetNames[0]
  if (!sheetName) {
    throw new Error('Missing worksheet')
  }
  return parseSheetRows(XLSX, workbook.Sheets[sheetName])
}

export const normalizeBaseUnit = (value: string): IngredientBaseUnit | null => {
  const normalized = value.toLowerCase().replace(/[^a-z]/g, '').trim()
  if (
    ['g', 'gm', 'gms', 'gram', 'grams', 'kilogram', 'kilograms', 'kg'].includes(
      normalized,
    )
  ) {
    return 'g'
  }
  if (
    ['ml', 'milliliter', 'milliliters', 'liter', 'liters', 'litre', 'litres', 'l'].includes(
      normalized,
    )
  ) {
    return 'ml'
  }
  if (['pcs', 'pc', 'piece', 'pieces', 'unit', 'units'].includes(normalized)) {
    return 'pcs'
  }
  return null
}

export const calculateUnitCostFromBulk = (
  baseUnit: IngredientBaseUnit,
  bulkQty: number,
  bulkUnit: string,
  bulkPrice: number,
) => {
  if (
    !Number.isFinite(bulkQty) ||
    bulkQty <= 0 ||
    !Number.isFinite(bulkPrice) ||
    bulkPrice < 0
  ) {
    return null
  }
  let baseQty = bulkQty
  if (baseUnit === 'g' && bulkUnit === 'kg') {
    baseQty = bulkQty * 1000
  }
  if (baseUnit === 'ml' && bulkUnit === 'l') {
    baseQty = bulkQty * 1000
  }
  if (baseQty <= 0) {
    return null
  }
  return bulkPrice / baseQty
}

export const parseIngredientImportRow = (row: ImportRow): ParsedIngredientImport => {
  const name = String(
    getRowValue(row, ['name', 'ingredient', 'ingredientname', 'item', 'ingredientitem']),
  ).trim()
  const inventoryId = String(
    getRowValue(row, ['inventoryid', 'inventory id', 'ingredientid', 'ingredient id', 'id']),
  ).trim()
  const ingredientType = normalizeIngredientType(
    getRowValue(row, ['ingredienttype', 'ingredient type', 'type', 'itemtype', 'item type']),
  )
  const category = String(getRowValue(row, ['category', 'cat'])).trim()
  const baseUnitRaw = String(getRowValue(row, ['baseunit', 'base unit', 'unit', 'uom'])).trim()

  if (!name && !category && !baseUnitRaw) {
    return { status: 'skip' }
  }
  if (!name || !category || !baseUnitRaw) {
    return { status: 'error' }
  }

  const baseUnit = normalizeBaseUnit(baseUnitRaw)
  if (!baseUnit) {
    return { status: 'error' }
  }

  const onHandRaw = getRowValue(row, [
    'onhand',
    'on hand',
    'stock',
    'qty',
    'quantity',
    'stockonhand',
    'onhandqty',
  ])
  const reorderRaw = getRowValue(row, [
    'reorder',
    'reorderlevel',
    'reorder level',
    'reorderpoint',
    'rol',
  ])
  const unitCostRaw = getRowValue(row, ['unitcost', 'unit cost', 'cost', 'costperunit'])
  const bulkQtyRaw = getRowValue(row, ['bulkqty', 'bulk qty', 'bulk quantity', 'packsize'])
  const bulkUnitRaw = String(
    getRowValue(row, ['bulkunits', 'bulk unit', 'bulkunit', 'packunit']),
  )
    .trim()
    .toLowerCase()
  const bulkPriceRaw = getRowValue(row, [
    'bulkprice',
    'bulk price',
    'bulk cost',
    'packprice',
    'priceperpack',
  ])

  const onHand = onHandRaw === '' ? 0 : parseNumber(onHandRaw)
  const reorderLevel = reorderRaw === '' ? 0 : parseNumber(reorderRaw)
  if (
    !Number.isFinite(onHand) ||
    onHand < 0 ||
    !Number.isFinite(reorderLevel) ||
    reorderLevel < 0
  ) {
    return { status: 'error' }
  }

  const unitCostValue = unitCostRaw === '' ? null : parseNumber(unitCostRaw)
  if (unitCostValue !== null && (!Number.isFinite(unitCostValue) || unitCostValue < 0)) {
    return { status: 'error' }
  }

  const bulkQty = bulkQtyRaw === '' ? null : parseNumber(bulkQtyRaw)
  const bulkPrice = bulkPriceRaw === '' ? null : parseNumber(bulkPriceRaw)
  const resolvedBulkUnit = bulkUnitRaw || baseUnit
  const derivedUnitCost =
    bulkQty !== null && bulkPrice !== null
      ? calculateUnitCostFromBulk(baseUnit, bulkQty, resolvedBulkUnit, bulkPrice)
      : null

  const finalUnitCost = unitCostValue !== null ? unitCostValue : derivedUnitCost
  if (finalUnitCost === null || !Number.isFinite(finalUnitCost)) {
    return { status: 'error' }
  }

  return {
    status: 'ok',
    payload: {
      name,
      inventoryId: inventoryId || undefined,
      ingredientType,
      category,
      baseUnit,
      onHand,
      reorderLevel,
      unitCost: finalUnitCost,
    },
  }
}
