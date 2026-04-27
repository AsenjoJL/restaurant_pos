import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '../../../app/store/hooks'
import { selectRuntimeMenuProducts } from '../../pos/menu.selectors'
import type { OrderType } from '../../pos/pos.types'
import { useKiosk } from '../useKiosk'
import {
  buildWelcomeTracks,
  formatWelcomeClock,
  WELCOME_ROW_ANIMATION_MAP,
} from '../welcome/welcome.page'

function useKioskWelcomePageController() {
  const navigate = useNavigate()
  const { reset, setOrderType } = useKiosk()
  const runtimeProducts = useAppSelector(selectRuntimeMenuProducts)
  const [isOpening, setIsOpening] = useState(false)
  const [isOrderTypeModalOpen, setIsOrderTypeModalOpen] = useState(false)
  const [clockLabel, setClockLabel] = useState(() => formatWelcomeClock(new Date()))
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({})

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

  return {
    brokenImages,
    clockLabel,
    isOpening,
    isOrderTypeModalOpen,
    rowAnimationMap: WELCOME_ROW_ANIMATION_MAP,
    tracks,
    handleCloseOrderTypeModal: () => setIsOrderTypeModalOpen(false),
    handleImageError: (image: string) => {
      setBrokenImages((prev) => ({ ...prev, [image]: true }))
    },
    handleOrderTypeSelect,
    handleStart,
  }
}

export default useKioskWelcomePageController
