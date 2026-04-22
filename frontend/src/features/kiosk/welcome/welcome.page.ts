import type { MenuProduct } from '../../pos/pos.types'
import { buildTickerRowsFromProducts, tickerRows } from './welcome.content'

export const WELCOME_ROW_ANIMATION_MAP = [
  'animate-[scroll-left_28s_linear_infinite]',
  'animate-[scroll-right_24s_linear_infinite]',
  'animate-[scroll-left_32s_linear_infinite]',
] as const

export const formatWelcomeClock = (date: Date) => {
  const hours24 = date.getHours()
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const seconds = date.getSeconds().toString().padStart(2, '0')
  const suffix = hours24 >= 12 ? 'PM' : 'AM'
  const hours12 = hours24 % 12 || 12
  return `${hours12}:${minutes}:${seconds} ${suffix}`
}

export const buildWelcomeTracks = (
  runtimeProducts: MenuProduct[],
) => {
  const usableProducts = runtimeProducts.filter((product) => typeof product.image === 'string')
  const rows = usableProducts.length > 0 ? buildTickerRowsFromProducts(usableProducts) : tickerRows
  return rows.map((row) => [...row, ...row])
}
