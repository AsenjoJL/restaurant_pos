import type { CartItem, DraftOrder } from './pos.types'

type PromoRuleType = 'PERCENT' | 'FIXED'

type PromoRule = {
  code: string
  label: string
  type: PromoRuleType
  value: number
  minSubtotal?: number
  orderTypes?: DraftOrder['orderType'][]
  startHour?: number
  endHour?: number
  active?: boolean
}

export type PromoEvaluation = {
  code: string
  label: string
  discount: number
  isValid: boolean
  reason?: string
}

const PROMO_RULES: PromoRule[] = [
  {
    code: 'WELCOME10',
    label: 'Welcome 10% Off',
    type: 'PERCENT',
    value: 10,
    minSubtotal: 300,
    active: true,
  },
  {
    code: 'TAKEOUT50',
    label: 'Takeout 50 Off',
    type: 'FIXED',
    value: 50,
    minSubtotal: 500,
    orderTypes: ['takeout'],
    active: true,
  },
  {
    code: 'DINEIN5',
    label: 'Dine-in 5% Off',
    type: 'PERCENT',
    value: 5,
    minSubtotal: 400,
    orderTypes: ['dine-in'],
    active: true,
  },
  {
    code: 'HAPPYHOUR15',
    label: 'Happy Hour 15% Off',
    type: 'PERCENT',
    value: 15,
    minSubtotal: 350,
    startHour: 14,
    endHour: 17,
    active: true,
  },
]

export const normalizePromoCode = (value: string) => value.trim().toUpperCase()

export const calculateCartSubtotal = (items: CartItem[]) =>
  items.reduce((sum, item) => {
    const unitPrice = item.finalUnitPrice ?? item.product.price
    return sum + unitPrice * item.quantity
  }, 0)

const isWithinPromoWindow = (rule: PromoRule, date: Date) => {
  if (rule.startHour === undefined || rule.endHour === undefined) {
    return true
  }
  const hour = date.getHours()
  return hour >= rule.startHour && hour < rule.endHour
}

export const evaluatePromoCode = ({
  code,
  subtotal,
  orderType,
  now = new Date(),
}: {
  code: string | null
  subtotal: number
  orderType: DraftOrder['orderType']
  now?: Date
}): PromoEvaluation | null => {
  if (!code) {
    return null
  }

  const normalized = normalizePromoCode(code)
  const rule = PROMO_RULES.find((item) => item.code === normalized)

  if (!rule || rule.active === false) {
    return {
      code: normalized,
      label: normalized,
      discount: 0,
      isValid: false,
      reason: 'Promo code not found.',
    }
  }

  if (rule.orderTypes && !rule.orderTypes.includes(orderType)) {
    return {
      code: rule.code,
      label: rule.label,
      discount: 0,
      isValid: false,
      reason: `Promo applies to ${rule.orderTypes.join(' / ')} only.`,
    }
  }

  if (rule.minSubtotal && subtotal < rule.minSubtotal) {
    return {
      code: rule.code,
      label: rule.label,
      discount: 0,
      isValid: false,
      reason: `Minimum order is ${rule.minSubtotal.toFixed(2)}.`,
    }
  }

  if (!isWithinPromoWindow(rule, now)) {
    return {
      code: rule.code,
      label: rule.label,
      discount: 0,
      isValid: false,
      reason: 'Promo is outside the active time window.',
    }
  }

  const computedDiscount =
    rule.type === 'PERCENT' ? subtotal * (rule.value / 100) : rule.value

  return {
    code: rule.code,
    label: rule.label,
    discount: Math.max(0, Math.min(computedDiscount, subtotal)),
    isValid: true,
  }
}

