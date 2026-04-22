import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../../app/store/hooks'
import { pushToast } from '../../../shared/store/ui.store'
import { selectOrders } from '../../orders/orders.selectors'
import { selectRuntimeMenuProducts } from '../../pos/menu.selectors'
import type { OrderType } from '../../pos/pos.types'
import { useKiosk } from '../useKiosk'
import {
  buildWelcomeTracks,
  formatWelcomeClock,
  WELCOME_ROW_ANIMATION_MAP,
} from '../welcome/welcome.page'

function useKioskWelcomePageController() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { reset, setOrderType } = useKiosk()
  const orders = useAppSelector(selectOrders)
  const runtimeProducts = useAppSelector(selectRuntimeMenuProducts)
  const [isOpening, setIsOpening] = useState(false)
  const [isOrderTypeModalOpen, setIsOrderTypeModalOpen] = useState(false)
  const [clockLabel, setClockLabel] = useState(() => formatWelcomeClock(new Date()))
  const [orderLookup, setOrderLookup] = useState('')
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({})
  const orderLookupRef = useRef<HTMLInputElement | null>(null)

  const handleStart = useCallback(() => {
    if (isOpening) {
      return
    }
    reset()
    setIsOrderTypeModalOpen(true)
  }, [isOpening, reset])

  const handleOrderTypeSelect = useCallback(
    (orderType: OrderType) => {
      if (isOpening) {
        return
      }
      setIsOpening(true)
      setOrderType(orderType)
      setIsOrderTypeModalOpen(false)
      window.setTimeout(() => {
        navigate('/kiosk/menu')
      }, 220)
    },
    [isOpening, navigate, setOrderType],
  )

  useEffect(() => {
    const timer = window.setInterval(() => {
      setClockLabel(formatWelcomeClock(new Date()))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [])

  const tracks = useMemo(() => buildWelcomeTracks(runtimeProducts), [runtimeProducts])

  const handleLookup = useCallback(() => {
    const normalized = orderLookup.trim().toUpperCase()
    if (!normalized) {
      orderLookupRef.current?.focus()
      dispatch(
        pushToast({
          title: 'Enter an order number',
          description: 'Type your queue number first so we can check the status.',
          variant: 'info',
        }),
      )
      return
    }

    const order = orders.find(
      (item) => item.order_no.toUpperCase() === normalized || item.id.toUpperCase() === normalized,
    )

    if (!order) {
      dispatch(
        pushToast({
          title: 'Order not found',
          description: `We could not find ${normalized}. Please double-check the slip number.`,
          variant: 'error',
        }),
      )
      return
    }

    navigate(`/kiosk/success/${order.order_no}`)
  }, [dispatch, navigate, orderLookup, orders])

  return {
    brokenImages,
    clockLabel,
    isOpening,
    isOrderTypeModalOpen,
    orderLookup,
    orderLookupRef,
    rowAnimationMap: WELCOME_ROW_ANIMATION_MAP,
    tracks,
    setOrderLookup,
    handleCloseOrderTypeModal: () => setIsOrderTypeModalOpen(false),
    handleImageError: (image: string) => {
      setBrokenImages((prev) => ({ ...prev, [image]: true }))
    },
    handleLookup,
    handleOrderTypeSelect,
    handleStart,
  }
}

export default useKioskWelcomePageController
