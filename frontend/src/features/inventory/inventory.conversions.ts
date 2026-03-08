import type {
  Ingredient,
  IngredientBaseUnit,
  MeasurementUnit,
} from './inventory.types'

export type ConversionResult =
  | { ok: true; baseQty: number }
  | { ok: false; reason: string }

const VOLUME_TO_ML: Record<'tbsp' | 'tsp' | 'cup', number> = {
  tbsp: 15,
  tsp: 5,
  cup: 240,
}

const MASS_TO_G: Record<'kg', number> = {
  kg: 1000,
}

const VOLUME_TO_ML_LARGE: Record<'l', number> = {
  l: 1000,
}

const ingredientSpecificConversions: Record<
  string,
  Partial<Record<'tbsp' | 'tsp' | 'cup', number>>
> = {
  'ing-sugar': { tbsp: 12.5, tsp: 4.2, cup: 200 },
  'ing-flour': { tbsp: 8, tsp: 2.7, cup: 120 },
  'ing-butter': { tbsp: 14, tsp: 4.7, cup: 227 },
  'ing-cocoa-powder': { tbsp: 5, tsp: 1.7, cup: 85 },
  'ing-baking-mix': { tbsp: 10, tsp: 3.3, cup: 130 },
  'ing-breadcrumbs': { tbsp: 6, tsp: 2, cup: 90 },
}

const isVolumeUnit = (unit: MeasurementUnit) =>
  unit === 'ml' || unit === 'l' || unit === 'tbsp' || unit === 'tsp' || unit === 'cup'

const isMassUnit = (unit: MeasurementUnit) => unit === 'g' || unit === 'kg'

export const getCompatibleUnits = (ingredient: Ingredient): MeasurementUnit[] => {
  const base = ingredient.baseUnit
  if (base === 'pcs') {
    return ['pcs']
  }
  if (base === 'ml') {
    return ['ml', 'l', 'tbsp', 'tsp', 'cup']
  }

  const units: MeasurementUnit[] = ['g', 'kg']
  const conversions = ingredientSpecificConversions[ingredient.id]
  if (conversions?.tbsp) units.push('tbsp')
  if (conversions?.tsp) units.push('tsp')
  if (conversions?.cup) units.push('cup')
  return units
}

export function convertToBase(
  ingredient: Ingredient,
  qty: number,
  unit?: MeasurementUnit,
): ConversionResult
export function convertToBase(
  ingredientId: string,
  qty: number,
  unit: MeasurementUnit | undefined,
  ingredients: Ingredient[],
): ConversionResult
export function convertToBase(
  ingredientOrId: Ingredient | string,
  qty: number,
  unit?: MeasurementUnit,
  ingredients?: Ingredient[],
): ConversionResult {
  const ingredient =
    typeof ingredientOrId === 'string'
      ? ingredients?.find((item) => item.id === ingredientOrId)
      : ingredientOrId

  if (!ingredient) {
    return { ok: false, reason: 'Ingredient not found for conversion.' }
  }

  const baseUnit = ingredient.baseUnit
  const resolvedUnit = unit ?? baseUnit

  if (baseUnit === 'pcs') {
    if (resolvedUnit !== 'pcs') {
      return {
        ok: false,
        reason: `Unit ${resolvedUnit} is not valid for ${ingredient.name}.`,
      }
    }
    return { ok: true, baseQty: qty }
  }

  if (baseUnit === 'g') {
    if (resolvedUnit === 'g') {
      return { ok: true, baseQty: qty }
    }
    if (resolvedUnit === 'kg') {
      return { ok: true, baseQty: qty * MASS_TO_G.kg }
    }
    if (isVolumeUnit(resolvedUnit)) {
      const conversions = ingredientSpecificConversions[ingredient.id]
      const multiplier = conversions?.[resolvedUnit as 'tbsp' | 'tsp' | 'cup']
      if (!multiplier) {
        return {
          ok: false,
          reason: `No ${resolvedUnit} conversion for ${ingredient.name}.`,
        }
      }
      return { ok: true, baseQty: qty * multiplier }
    }
    return {
      ok: false,
      reason: `Unit ${resolvedUnit} is not compatible with ${ingredient.name}.`,
    }
  }

  if (baseUnit === 'ml') {
    if (resolvedUnit === 'ml') {
      return { ok: true, baseQty: qty }
    }
    if (resolvedUnit === 'l') {
      return { ok: true, baseQty: qty * VOLUME_TO_ML_LARGE.l }
    }
    if (resolvedUnit === 'tbsp' || resolvedUnit === 'tsp' || resolvedUnit === 'cup') {
      return { ok: true, baseQty: qty * VOLUME_TO_ML[resolvedUnit] }
    }
    if (isMassUnit(resolvedUnit)) {
      return {
        ok: false,
        reason: `Unit ${resolvedUnit} is not compatible with ${ingredient.name}.`,
      }
    }
  }

  return {
    ok: false,
    reason: `Unit ${resolvedUnit} is not compatible with ${ingredient.name}.`,
  }
}
