import { useCallback, useRef, useState, type ChangeEvent } from 'react'
import { useAppDispatch } from '../../../app/store/hooks'
import { DATA_FILE_ACCEPT } from '../../../shared/lib/exportFiles'
import { pushToast } from '../../../shared/store/ui.store'
import type { Ingredient } from '../inventory.types'
import { parseInventoryImportFile } from '../inventory.import'
import {
  downloadInventoryExport,
  downloadInventoryTemplate,
  INVENTORY_FILE_FORMAT_OPTIONS,
  type InventoryFileFormat,
} from '../inventory.export'
import { syncImportedIngredients } from '../inventory.import-sync'
import { refreshInventorySnapshot } from '../inventory.sync'
import { syncUpsertIngredient } from '../inventory.store'

type InventoryLookup = Map<string, Ingredient>

type UseInventoryImportExportOptions = {
  ingredients: Ingredient[]
  ingredientByInventoryId: InventoryLookup
  ingredientByName: InventoryLookup
}

function useInventoryImportExport({
  ingredients,
  ingredientByInventoryId,
  ingredientByName,
}: UseInventoryImportExportOptions) {
  const dispatch = useAppDispatch()
  const [isImporting, setIsImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const openImportFilePicker = useCallback((format: InventoryFileFormat) => {
    const input = fileInputRef.current
    if (!input) {
      return
    }
    input.accept = DATA_FILE_ACCEPT[format]
    input.click()
  }, [])

  const handleImport = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) {
        return
      }
      setIsImporting(true)
      try {
        const rows = await parseInventoryImportFile(file)

        const summary = await syncImportedIngredients({
          rows,
          lookup: {
            ingredientByName,
            ingredientByInventoryId,
          },
          upsertIngredient: async (payload) => {
            await dispatch(syncUpsertIngredient(payload)).unwrap()
          },
        })

        if (summary.imported > 0 || summary.updated > 0) {
          await refreshInventorySnapshot(dispatch)
        }

        dispatch(
          pushToast({
            title: 'Import complete',
            description: `Imported ${summary.imported}, updated ${summary.updated}, skipped ${summary.skipped}, errors ${summary.errors}.`,
            variant: summary.errors > 0 ? 'warning' : 'success',
          }),
        )
      } catch {
        dispatch(
          pushToast({
            title: 'Import failed',
            description:
              'Could not read the file. Use an Excel, CSV, or JSON inventory template.',
            variant: 'error',
          }),
        )
      } finally {
        setIsImporting(false)
        event.target.value = ''
      }
    },
    [dispatch, ingredientByInventoryId, ingredientByName],
  )

  const handleExportInventory = useCallback(
    async (format: InventoryFileFormat) => {
      try {
        await downloadInventoryExport({
          format,
          ingredients,
        })
        dispatch(
          pushToast({
            title: 'Inventory exported',
            description: `Exported ${ingredients.length} ingredient records.`,
            variant: 'success',
          }),
        )
      } catch {
        dispatch(
          pushToast({
            title: 'Export failed',
            description: 'Could not generate the inventory export file.',
            variant: 'error',
          }),
        )
      }
    },
    [dispatch, ingredients],
  )

  const handleDownloadTemplate = useCallback(
    async (format: InventoryFileFormat) => {
      try {
        await downloadInventoryTemplate(format)
        dispatch(
          pushToast({
            title: 'Template ready',
            description: `Generated ${format.toUpperCase()} import template.`,
            variant: 'success',
          }),
        )
      } catch {
        dispatch(
          pushToast({
            title: 'Template failed',
            description: 'Could not generate the inventory import template.',
            variant: 'error',
          }),
        )
      }
    },
    [dispatch],
  )

  return {
    fileFormatOptions: INVENTORY_FILE_FORMAT_OPTIONS,
    fileInputRef,
    handleDownloadTemplate,
    handleExportInventory,
    handleImport,
    isImporting,
    openImportFilePicker,
  } as const
}

export default useInventoryImportExport
