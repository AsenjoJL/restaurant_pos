import { useCallback, useEffect, useRef, useState } from 'react'
import { triggerPrint } from '../lib/print'

type ScheduledPrintOptions = {
  startDelayMs?: number
  clearDelayMs?: number
  silent?: boolean
}

export function useScheduledPrint(options?: ScheduledPrintOptions) {
  const startDelayMs = options?.startDelayMs ?? 300
  const clearDelayMs = options?.clearDelayMs ?? 900
  const silent = options?.silent ?? true

  const [printId, setPrintId] = useState<string | null>(null)
  const timersRef = useRef<number[]>([])

  const clear = useCallback(() => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer))
    timersRef.current = []
    setPrintId(null)
  }, [])

  const schedulePrint = useCallback(
    (id: string) => {
      clear()
      setPrintId(id)
      timersRef.current.push(
        window.setTimeout(() => {
          void triggerPrint({ silent })
        }, startDelayMs),
      )
      timersRef.current.push(
        window.setTimeout(() => setPrintId(null), clearDelayMs),
      )
    },
    [clear, clearDelayMs, silent, startDelayMs],
  )

  useEffect(() => clear, [clear])

  return {
    printId,
    schedulePrint,
    clear,
  }
}

export default useScheduledPrint

