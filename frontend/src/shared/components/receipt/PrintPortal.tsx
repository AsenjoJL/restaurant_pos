import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

const PRINT_ROOT_ID = 'print-root'

const ensurePrintRoot = () => {
  const existing = document.getElementById(PRINT_ROOT_ID)
  if (existing) {
    return existing
  }
  const element = document.createElement('div')
  element.id = PRINT_ROOT_ID
  document.body.appendChild(element)
  return element
}

type PrintPortalProps = {
  children: ReactNode
}

function PrintPortal({ children }: PrintPortalProps) {
  const [container, setContainer] = useState<HTMLElement | null>(null)

  useEffect(() => {
    setContainer(ensurePrintRoot())
  }, [])

  if (!container) {
    return null
  }

  return createPortal(children, container)
}

export default PrintPortal
