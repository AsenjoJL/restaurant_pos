import type { PaymentMethod } from '../../../shared/types/order'
import type { Order } from '../../../shared/types/order'

export type DerivedPaymentInputs = {
  total: number
  amountReceived: string
  amountNumber: number
  hasAmount: boolean
  isAmountValid: boolean
  change: number
  paymentCaptured: boolean
  paymentMethod: PaymentMethod
  cardReference: string
  walletReference: string
  walletPayer: string
  isCash: boolean
  requiresReference: boolean
  isInsufficient: boolean
  missingReference: boolean
}

export function derivePaymentInputs({
  activeOrderId,
  order,
  fallbackTotal,
  amountReceivedMap,
  methodMap,
  cardRefMap,
  walletRefMap,
  walletPayerMap,
  isPaymentCaptured,
}: {
  activeOrderId: string | null
  order: Order | null
  fallbackTotal: number
  amountReceivedMap: Record<string, string>
  methodMap: Record<string, PaymentMethod>
  cardRefMap: Record<string, string>
  walletRefMap: Record<string, string>
  walletPayerMap: Record<string, string>
  isPaymentCaptured: (order: Order) => boolean
}): DerivedPaymentInputs {
  const amountReceived = activeOrderId ? amountReceivedMap[activeOrderId] ?? '' : ''
  const total = order?.total ?? fallbackTotal
  const paymentCaptured = order ? isPaymentCaptured(order) : false

  const paymentMethod =
    order?.payment_method ?? (activeOrderId ? methodMap[activeOrderId] ?? 'CASH' : 'CASH')
  const cardReference =
    order?.payment_reference ?? (activeOrderId ? cardRefMap[activeOrderId] ?? '' : '')
  const walletReference =
    order?.payment_reference ?? (activeOrderId ? walletRefMap[activeOrderId] ?? '' : '')
  const walletPayer =
    order?.payment_payer ?? (activeOrderId ? walletPayerMap[activeOrderId] ?? '' : '')

  const amountNumber = Number(amountReceived)
  const hasAmount = amountReceived.trim().length > 0
  const isAmountValid = hasAmount && !Number.isNaN(amountNumber)
  const change = isAmountValid ? amountNumber - total : 0
  const isCash = paymentMethod === 'CASH'
  const requiresReference = paymentMethod === 'GCASH' || paymentMethod === 'OTHER'
  const isInsufficient = isCash ? !isAmountValid || change < 0 : false
  const missingReference = !paymentCaptured && requiresReference && walletReference.trim().length === 0

  return {
    total,
    amountReceived,
    amountNumber,
    hasAmount,
    isAmountValid,
    change,
    paymentCaptured,
    paymentMethod,
    cardReference,
    walletReference,
    walletPayer,
    isCash,
    requiresReference,
    isInsufficient,
    missingReference,
  }
}

export function buildPaymentPayload({
  paymentMethod,
  isCash,
  amountNumber,
  total,
  change,
  cardReference,
  requiresReference,
  walletReference,
  walletPayer,
}: {
  paymentMethod: PaymentMethod
  isCash: boolean
  amountNumber: number
  total: number
  change: number
  cardReference: string
  requiresReference: boolean
  walletReference: string
  walletPayer: string
}) {
  const paymentAmount = isCash ? amountNumber : total
  return {
    method: paymentMethod,
    amount: paymentAmount,
    change: isCash ? Math.max(change, 0) : undefined,
    reference:
      paymentMethod === 'CARD'
        ? cardReference.trim() || undefined
        : requiresReference
          ? walletReference.trim() || undefined
          : undefined,
    payer: requiresReference ? walletPayer.trim() || undefined : undefined,
  }
}

