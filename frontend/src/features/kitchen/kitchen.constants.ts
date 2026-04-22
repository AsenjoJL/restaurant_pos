import type { KitchenStation } from '../pos/pos.types'

export const KITCHEN_ALL_STATIONS = 'ALL'

export type KitchenStationFilter = KitchenStation | typeof KITCHEN_ALL_STATIONS
