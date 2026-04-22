import { parseIngredientImportRow } from './inventory.import'
import type { Ingredient } from './inventory.types'

type ImportPayload = Pick<
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

type ImportSyncUpsert = (payload: ImportPayload & { id?: string }) => Promise<void>

type ImportLookupMaps = {
  ingredientByName: Map<string, Ingredient>
  ingredientByInventoryId: Map<string, Ingredient>
}

export type InventoryImportSummary = {
  imported: number
  updated: number
  skipped: number
  errors: number
}

const getExistingIngredient = (payload: ImportPayload, lookup: ImportLookupMaps) => {
  const inventoryId = payload.inventoryId?.trim().toUpperCase()
  if (inventoryId) {
    const byInventoryId = lookup.ingredientByInventoryId.get(inventoryId)
    if (byInventoryId) {
      return byInventoryId
    }
  }
  return lookup.ingredientByName.get(payload.name.toLowerCase())
}

export const syncImportedIngredients = async ({
  rows,
  lookup,
  upsertIngredient,
}: {
  rows: Record<string, unknown>[]
  lookup: ImportLookupMaps
  upsertIngredient: ImportSyncUpsert
}): Promise<InventoryImportSummary> => {
  const summary: InventoryImportSummary = {
    imported: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
  }

  for (const row of rows) {
    const result = parseIngredientImportRow(row)

    if (result.status === 'skip') {
      summary.skipped += 1
      continue
    }

    if (result.status === 'error') {
      summary.errors += 1
      continue
    }

    const existing = getExistingIngredient(result.payload, lookup)
    try {
      if (existing) {
        await upsertIngredient({ id: existing.id, ...result.payload })
        summary.updated += 1
      } else {
        await upsertIngredient(result.payload)
        summary.imported += 1
      }
    } catch {
      summary.errors += 1
    }
  }

  return summary
}
